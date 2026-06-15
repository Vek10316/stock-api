import sql from 'mssql';

export type ObjectEntries = {
    keys: string[];
    values: any[];
    types: string[];
};

export type SqlSort = {
    column: string;
    direction?: "ASC" | "DESC";
}

export const splitObjectEntries = async (o: Object): Promise<ObjectEntries> => {
    const keys = Object.keys(o);
    const values = Object.values(o);
    let types: string[] = [];
    values.forEach(v => { types.push(typeof v) });
    return { keys, values, types };
};

export const buildSqlConditions = async (o: Object, options?: { prefix?: string, sort?: SqlSort }): Promise<string> => {
    let conditions = "";
    let prefix = options?.prefix ?? "";
    if (prefix.trim() !== "") {
        prefix = prefix.trim();
        if (!prefix.endsWith(".")) prefix += "."
    }
    if (o != undefined) {
        const entries = await splitObjectEntries(o);
        for (var i = 0; i < entries.keys.length; i++) {
            const valueToString = typeof entries.values[i] === 'number' ?
                `${entries.values[i]}` :
                `'${entries.values[i]}'`
            conditions += (i + 1 <= 1) ?
                ` WHERE ${prefix}${entries.keys[i]} = ${valueToString}` :
                ` AND ${prefix}${entries.keys[i]} = ${valueToString}`;
        }
    }
    if (options?.sort) {
        conditions += ` ORDER BY ${options.sort.column} ${options.sort.direction ?? "ASC"}`;
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
}