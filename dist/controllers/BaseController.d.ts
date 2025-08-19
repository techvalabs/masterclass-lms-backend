import { Pool } from 'mysql2/promise';
export declare class BaseController {
    protected getDatabase(): Pool;
    protected withTransaction<T>(callback: (connection: any) => Promise<T>): Promise<T>;
}
//# sourceMappingURL=BaseController.d.ts.map