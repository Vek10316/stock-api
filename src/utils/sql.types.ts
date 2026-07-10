//sql.types.ts
export type SelectMode<TTables extends SqlTables> =
    | { selectAll: true; columns?: never }
    | { selectAll: false; columns: SqlColumn<TTables>[] };

export type SqlTables = Record<string, object>;

export type SqlColumn<
    TTables extends SqlTables,
    TSource extends keyof TTables = keyof TTables
> = {
    alias: TSource;
    column: Extract<keyof TTables[TSource], string>;
};

export type SqlCondition<TTables extends SqlTables = any> =
    | {
        column: SqlColumn<TTables>;
        operator: "IS" | "NOT";
        condition: string | number | boolean | Date | null;
    }
    | {
        column: SqlColumn<TTables>;
        operator: "LIKE";
        condition: string;
    }
    | {
        column: SqlColumn<TTables>;
        operator: ">" | "<" | ">=" | "<=";
        condition: number | Date;
    }
    | {
        column: SqlColumn<TTables>;
        operator: "BETWEEN";
        condition: [number | Date, number | Date];
    };

export type SqlJoin<TTables extends SqlTables = any> = {
    table: string;
    alias: keyof TTables & string;
    joinType: "INNER" | "LEFT" | "RIGHT" | "FULL";
    on: {
        left: SqlColumn<TTables>;
        operator: "=";
        right: SqlColumn<TTables>;
    }[];
};

export type JoinMode<TTables extends SqlTables = any> = {
    alias: keyof TTables & string;
    joins?: SqlJoin<TTables>[];
};

export type PaginationMode =
    | { sort: SqlSort; pagination?: SqlPagination }
    | { sort?: undefined; pagination?: never };

export type SqlSort<TTables extends SqlTables = any> = {
    column: SqlColumn<TTables>;
    order?: "ASC" | "DESC";
};

export type SqlPagination = {
    limit: number;
    offset: number;
};

export type SqlSelectOptions<TTables extends SqlTables = any> =
    SelectMode<TTables> &
    JoinMode<TTables> &
    PaginationMode;

export type SqlSearchQuery<TTables extends SqlTables = any> = {
    column: SqlColumn<TTables>;
    searchQuery: string;
};