import sql from 'mssql';

export type ObjectEntries = {
    keys: string[];
    values: any[];
    types: string[];
};

export type SqlSort = {
    column: string;
    direction?: "ASC" | "DESC";
};

export type SqlClauseOptions = {
    prefix?: string | undefined;
    dateRange?: {
        column: string,
        startDate: Date,
        endDate: Date
    };
    sort?: SqlSort | undefined;
    pagination?: {
        pageSize: number,
        pageNumber: number,
    };
    search?: {
        columns: string[],
        searchQuery: string,
    }
};

export type SearchQuery = {
    columns: string[],
    searchQuery: string,
};

export const splitObjectEntries = async (o: Object): Promise<ObjectEntries> => {
    if (o === undefined) return {keys: [], values: [], types: []};
    const keys = Object.keys(o);
    const values = Object.values(o);
    let types: string[] = [];
    values.forEach(v => { types.push(typeof v) });
    return { keys, values, types };
};

export const buildSqlConditions = async (o: Object, options?: SqlClauseOptions): Promise<string> => {
    let conditions = "";
    let prefix = options?.prefix ?? "";
    if (prefix.trim() !== "") {
        prefix = prefix.trim();
        if (!prefix.endsWith(".")) prefix += "."
    }
    const entries = await splitObjectEntries(o);
    if (options?.search !== undefined && options?.search.searchQuery.trim() !== "") {
        options?.search.columns.forEach(col => {
            conditions += !conditions.includes("WHERE") ?
                ` WHERE (${col} LIKE '%${options.search?.searchQuery}%')` : 
                conditions.includes("WHERE (") ?
                ` OR (${col} LIKE '%${options.search?.searchQuery}%')` :
                ` AND (${col} LIKE '%${options.search?.searchQuery}%')`

        });
    }
    if (o !== undefined) {
        for (var i = 0; i < entries.keys.length; i++) {
            const valueToString = typeof entries.values[i] === 'number' ?
                `${entries.values[i]}` :
                `'${entries.values[i]}'`
            conditions += !conditions.includes("WHERE") ?
                ` WHERE ${prefix}${entries.keys[i]} = ${valueToString}` :
                ` AND ${prefix}${entries.keys[i]} = ${valueToString}`;
        }
    }
    if (options?.dateRange) {
        const startDate = options.dateRange.startDate.toLocaleDateString("en-CA");
        const endDate = options.dateRange.endDate.toLocaleDateString("en-CA");
        conditions += !conditions.includes("WHERE") ?
            ` WHERE ${prefix}${options.dateRange.column} BETWEEN '${startDate}' AND '${endDate}'` :
            ` AND ${prefix}${options.dateRange.column} BETWEEN '${startDate}' AND '${endDate}'`;
    }
    if (options?.sort !== undefined) {
        conditions += ` ORDER BY ${prefix}${options.sort.column} ${options.sort.direction ?? "ASC"}`;
    }
    if (options?.pagination !== undefined && !isNaN(options?.pagination?.pageNumber) && !isNaN(options?.pagination?.pageSize)) {
        if (options?.sort === undefined) {
            " ORDER BY (SELECT NULL)"
        }
        conditions += ` OFFSET ${((options.pagination.pageNumber - 1) * options.pagination.pageSize)} ROWS` +
            ` FETCH NEXT ${options.pagination.pageSize} ROWS ONLY`;
    }
    return conditions;
};

export const buildSqlInsertQuery = async (table: string, insertData: Object, transaction: sql.Transaction, request: sql.Request): Promise<string> => {
    if (!request) {
        request = new sql.Request(transaction);
    }
    const entries = await splitObjectEntries(insertData);
    const k = entries.keys;
    const v = entries.values;
    let parameters: string[] = [];
    entries.keys.forEach(c => {
        parameters.push(`@${c}`);
    });

    for (var i = 0; i < k.length; i++) {
        request.input(k[i], v[i]);
    }

    const query = `INSERT INTO ${table} (${entries.keys.join(", ")}) VALUES (${parameters.join(", ")});`;
    return query;
};

export const buildSqlUpdateQuery = async (table: string, updateData: Object, condition: Object, transaction: sql.Transaction, request?: sql.Request): Promise<string> => {
    if (!request) {
        request = new sql.Request(transaction);
    }

    const entries = await splitObjectEntries(updateData);
    const k = entries.keys;
    const v = entries.values;
    let parameters: string[] = [];
    entries.keys.forEach(k => {
        parameters.push(`${k} = @${k}`);
    });

    for (var i = 0; i < k.length; i++) {
        request.input(k[i], v[i]);
    }

    const c = await buildSqlConditions(condition);
    const query = `UPDATE ${table} SET ${parameters.join(", ")}${c};`;
    return query;
};