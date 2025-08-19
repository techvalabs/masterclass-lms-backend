import { Request, Response } from 'express';
import mysql from 'mysql2/promise';
export default class AdminLessonsController {
    private db;
    constructor(db: mysql.Pool | null);
    private getDatabase;
    /**
     * Get all lessons for a course
     */
    getLessons(req: Request, res: Response): Promise<void>;
    /**
     * Get lesson by ID
     */
    getLessonById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Create new lesson
     */
    createLesson(req: Request, res: Response): Promise<void>;
    /**
     * Update lesson
     */
    updateLesson(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Delete lesson
     */
    deleteLesson(req: Request, res: Response): Promise<void>;
    /**
     * Reorder lessons
     */
    reorderLessons(req: Request, res: Response): Promise<void>;
    /**
     * Get quizzes for a lesson
     */
    getQuizzes(req: Request, res: Response): Promise<void>;
    /**
     * Create quiz
     */
    createQuiz(req: Request, res: Response): Promise<void>;
    /**
     * Update quiz
     */
    updateQuiz(req: Request, res: Response): Promise<void>;
    /**
     * Delete quiz
     */
    deleteQuiz(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=AdminLessonsController.d.ts.map