import Book from "../models/Book.js";
import Borrowal from "../models/Borrowal.js";
import Member from "../models/Member.js";


export const addNewBook = async (req, res) => { 
    try {
        const { name, isbn, info } = req.body;

        if (!name || !isbn) {
            return res.status(400).json({ message: "Name and ISBN are required fields" });
        }

        const newBook = await Book.create({ name, isbn, info });

        return res.status(201).json({ 
            message: "New book added successfully",
            newBook
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: "A book with this ISBN already exists" });
        }
        return res.status(500).json({ message: error.message });
    }
};

export const lendBook = async (req, res) => {
    try {
        const { bookId, memberId, dueDate } = req.body;

        if (!bookId || !memberId || !dueDate) {
            return res.status(400).json({ message: "bookId, memberId, and dueDate are required" });
        }

        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({ message: "Book not found in database" });
        }
        if (book.avStatus === false) {
            return res.status(400).json({ message: "This book is currently lent out to someone else" });
        }

        const member = await Member.findById(memberId);
        if (!member) {
            return res.status(404).json({ message: "Member not found. Cannot issue book." });
        }
        if (member.memStatus !== "active") {
            return res.status(403).json({ message: `Cannot lend books to a ${member.memStatus} account.` });
        }

        await Book.findByIdAndUpdate(bookId, { avStatus: false });

        const lentBook = await Borrowal.create({ bookId, memberId, dueDate });

        return res.status(201).json({
            message: "Book successfully issued!",
            transaction: lentBook
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const returnBook = async (req, res) => {
    try {
        const { bookId, memberId } = req.body;

        if (!bookId || !memberId) {
            return res.status(400).json({ message: "bookId and memberId are required fields" });
        }

        const activeBorrowal = await Borrowal.findOne({
            bookId,
            memberId,
            returnDate: { $exists: false }
        });

        if (!activeBorrowal) {
            return res.status(404).json({ 
                message: "No active transaction found for this book and member combo." 
            });
        }

        const today = new Date();
        activeBorrowal.returnDate = today;
        await activeBorrowal.save();

        await Book.findByIdAndUpdate(bookId, { avStatus: true });

        let fine = 0;
        const dueDate = new Date(activeBorrowal.dueDate);

        if (today > dueDate) {
            const timeDifference = today.getTime() - dueDate.getTime();
            const overdueDays = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
            fine = overdueDays * 1; // ₹1 per day
            
            // Persist the calculated fine directly onto the member's profile
            await Member.findByIdAndUpdate(memberId, { $inc: { fine: fine } });
        }

        return res.status(200).json({
            message: "Book returned successfully!",
            fineCharged: fine,
            daysOverdue: today > dueDate ? Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)) : 0,
            transaction: activeBorrowal
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


export const updateFine = async (req, res) => {
    try {
        const { email, amountPaid } = req.body;

        if (!email || amountPaid === undefined) {
            return res.status(400).json({ message: "Email and amountPaid are mandatory parameters." });
        }

        const member = await Member.findOne({ email });
        if (!member) {
            return res.status(404).json({ message: "Member not found." });
        }

        if (member.fine === 0) {
            return res.status(400).json({ message: "This member does not have any pending fines." });
        }

        // Calculate new fine liability ($max prevents fine balance from dropping below 0)
        member.fine = Math.max(0, member.fine - amountPaid);
        await member.save();

        return res.status(200).json({
            message: `Payment of ₹${amountPaid} processed successfully.`,
            remainingFine: member.fine,
            member
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};