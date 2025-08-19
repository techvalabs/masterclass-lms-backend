export declare function seedUsers(): Promise<void>;
export declare const userIds: {
    admin: string;
    instructor: string;
    student1: string;
    student2: string;
    student3: string;
};
export declare const userData: ({
    id: string;
    name: string;
    email: string;
    password: string;
    role: string;
    avatar: string;
    is_active: boolean;
    email_verified_at: Date;
} | {
    id: string;
    name: string;
    email: string;
    password: string;
    role: string;
    avatar: null;
    is_active: boolean;
    email_verified_at: Date;
})[];
export default seedUsers;
//# sourceMappingURL=users.d.ts.map