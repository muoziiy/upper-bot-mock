import { Router } from 'express';
import { supabase } from '../supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';


const router = Router();

// Initialize Gemini (Replace with process.env.GEMINI_API_KEY)
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// GET /exams - List all exams
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('exams')
            .select('*, questions(count)')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// GET /exams/:id - Get exam details
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('exams')
            .select('*, questions(*)')
            .eq('id', id)
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// POST /exams - Create exam
router.post('/', async (req, res) => {
    try {
        const { title, description, teacher_id, group_id, duration_minutes, type, location, ai_generated } = req.body;
        const { data, error } = await supabase
            .from('exams')
            .insert([{ title, description, teacher_id, group_id, duration_minutes, type, location, ai_generated }])
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// PUT /exams/:id - Update exam
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const { data, error } = await supabase
            .from('exams')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// POST /exams/:id/questions - Add questions
router.post('/:id/questions', async (req, res) => {
    try {
        const { id } = req.params;
        const { questions } = req.body; // Array of questions

        // Ensure all questions have the exam_id
        const questionsWithId = questions.map((q: any) => ({ ...q, exam_id: id }));

        const { data, error } = await supabase
            .from('questions')
            .insert(questionsWithId)
            .select();

        if (error) throw error;
        res.json(data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// POST /exams/generate-ai - Generate questions from PDF URL
router.post('/generate-ai', async (req, res) => {
    try {
        const { fileUrl, count = 5 } = req.body;

        if (!process.env.GEMINI_API_KEY) {
            // Mock response if no key
            console.log('No GEMINI_API_KEY found, returning mock data');
            const mockQuestions = Array.from({ length: count }).map((_, i) => ({
                text: `AI Generated Question ${i + 1} from PDF`,
                type: 'multiple_choice',
                options: ['Correct Answer', 'Wrong A', 'Wrong B', 'Wrong C'],
                correct_answer: 'Correct Answer',
                points: 1
            }));
            return res.json({ questions: mockQuestions });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

        // Fetch the PDF
        const response = await fetch(fileUrl);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Convert to base64
        const base64Data = buffer.toString('base64');

        const prompt = `
      Analyze this document. Create ${count} multiple choice questions based on the content.
      Return ONLY a raw JSON array (no markdown formatting) with this structure:
      [
        {
          "text": "Question text",
          "type": "multiple_choice",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correct_answer": "Option A",
          "points": 1
        }
      ]
    `;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Data,
                    mimeType: "application/pdf",
                },
            },
        ]);

        const text = result.response.text();

        // Clean up markdown code blocks if present
        const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const questions = JSON.parse(jsonString);

        res.json({ questions });
    } catch (error: any) {
        console.error('AI Generation Error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
