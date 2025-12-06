import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Only images allowed'));
    cb(null, true);
  }
});

// KYC upload middleware - accepts images and PDFs
export const uploadKycFiles = multer({
  storage: multer.memoryStorage(), // Store in memory for processing
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10 MB per file
    fieldSize: 50 * 1024 * 1024 // 50 MB total
  },
  fileFilter: (req, file, cb) => {
    // Accept images and PDFs
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only images and PDF files are allowed'));
    }
  }
}).fields([
  { name: 'id_document', maxCount: 1 },
  { name: 'address_proof_document', maxCount: 1 },
  { name: 'signature', maxCount: 1 }
]);

// Inward document upload middleware - accepts multiple images and PDFs
export const uploadInwardDocuments = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      // Upload to uploads/inward directory relative to server root
      const uploadPath = path.join(__dirname, '../../uploads/inward');
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      // Generate unique filename: timestamp-originalname
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + '-' + file.originalname);
    }
  }),
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10 MB per file
    files: 10 // Maximum 10 files
  },
  fileFilter: (req, file, cb) => {
    // Accept images and PDFs
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only images and PDF files are allowed'));
    }
  }
}).array('documents', 10); // Accept up to 10 files with field name 'documents'
