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
  values.forEach(v => {types.push(typeof v)});
  return { keys, values, types };
};

export const buildSqlConditions = async (o: Object, sort?: SqlSort): Promise<string> => {
  let conditions = "";
  if (o != undefined) {
    const entries = await splitObjectEntries(o);
    for (var i = 0; i < entries.keys.length; i++) {
      const valueToString = typeof entries.values[i] === 'number' ?
        `${entries.values[i]}` :
        `'${entries.values[i]}'`
      conditions += (i+1 <= 1) ?
        ` WHERE ${entries.keys[i]} = ${valueToString}` :
        ` AND ${entries.keys[i]} = ${valueToString}`;
    }
  }
  if (sort) {
    conditions += ` ORDER BY ${sort.column} ${sort.direction ?? "ASC"}`;
  }
  return conditions;
};

export const buildSqlInsertQuery = async (table: string, insertData: Object, request?: sql.Request): Promise<string> => {
  const entries = await splitObjectEntries(insertData);
  const k = entries.keys;
  const v = entries.values;
  let parameters: string[] = [];
  entries.keys.forEach(c => {
    parameters.push(`@${c}`);
  });

  if (request) {
    for (var i = 0; i < k.length; i++) {
      request.input(k[i], v[i]); 
    }
  }

  const query = `INSERT INTO ${table} (${entries.keys.join(", ")}) VALUES (${parameters.join(", ")});`;
  return query;
};

export const buildSqlUpdateQuery = async (table: string, updateData: Object, condition: Object, request?: sql.Request): Promise<string> => {
  const entries = await splitObjectEntries(updateData);
  const k = entries.keys;
  const v = entries.values;
  let parameters: string[] = [];
  entries.keys.forEach(k => {
    parameters.push(`${k} = @${k}`); 
  });

  if (request) {
    for (var i = 0; i < k.length; i++) {
      request.input(k[i], v[i]);
    }
  }

  const c = await buildSqlConditions(condition);
  const query = `UPDATE ${table} SET ${parameters.join(", ")}${c};`;
  return query; 
}