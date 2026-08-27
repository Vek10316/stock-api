export type ApiPaginatedResponse<T extends object = any> = {
    data: T;
    metadata: {
        pageNo: number;
        pageSize: number;
        totalPages: number;
        totalCount: number;
    };
};

export type DateRange = {
    startDate: Date;
    endDate: Date;
}