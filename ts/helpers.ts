const ARR_OPEN_PAREN = '[';
const ARR_CLOSE_PAREN = ']';
const DOT = '.';

export type FieldMap = {[x: string]: string};

export function map(obj: any, fieldMap: FieldMap) {
    const target: { [x: string]: any; } = {};
    const deflatedSrc = deflate(obj);

    Object.keys(fieldMap).forEach( key => {
        const srcValue = deflatedSrc[key];
        if (srcValue) {
            setFlatField(fieldMap[key], target, srcValue);
        }
    });

    return target;
}

export function deflate(obj: { [x: string]: any; }, prefix = ''): { [x: string]: any;  } {
    return Object.keys(obj).reduce((acc, k) => {
        let fieldPrefix = '';
        if (prefix.length) {
            fieldPrefix = `${prefix}.`;
        }
        if (isNestedObj(obj[k])) Object.assign(acc, deflate(obj[k], fieldPrefix + k));
        else if (Array.isArray(obj[k])) {
            const arr = obj[k] as [];
            arr.forEach((value, index) => {
                if (isNestedObj(value)) {
                    Object.assign(acc, deflate(value, `${fieldPrefix}${k}[${index}]`));
                } else if (Array.isArray(value)) {
                    throw new Error('Unsupported - Array of Array');
                } else {
                    acc[`${fieldPrefix}${k}[${index}]`] = value;
                }
            });

        }
        else acc[fieldPrefix + k] = obj[k];
        return acc;
    }, {} as { [x: string]: any; });
}


function isNestedObj(obj: any) {
    return !Array.isArray(obj) && obj === Object(obj);
}

export function inflate(obj: { [x: string]: any; }, prefix = '') {
    const inflated: { [x: string]: any; } = {};
    Object.keys(obj).forEach((fieldPath: string) => {
        const leafValue = obj[fieldPath];
        const fields = fieldPath.split('.');
        let curObj = inflated;
        fields.forEach((field, index) => {
            if (index + 1 === fields.length) {
                setLeafField(field, curObj,  leafValue);
            } else if (!getLeafField(field, curObj)) {
                setLeafField(field, curObj,  {});
            }
            curObj = getLeafField(field, curObj);
        });
    });
    return inflated;
}

export function setFlatField(fieldPath: string, obj: { [x: string]: any }, value: any) {
    if (!obj) {
        return;
    }

    let ret;

    const firstDotPos = fieldPath.indexOf(DOT);
    if (firstDotPos !== -1) {
        const head = fieldPath.substring(0, firstDotPos);
        const tail = fieldPath.substring(firstDotPos + 1);
        let nextObj = getLeafField(head, obj);
        if (!nextObj) {
            nextObj = {};
            setLeafField(head, obj, nextObj);
        }
        setFlatField(tail, nextObj, value);
    } else {
        return setLeafField(fieldPath, obj, value);
    }

    return ret;
}

function setLeafField(field: string, obj: { [x: string]: any }, value: any) {
    if (!obj) {
        return;
    }

    if (!isArr(field)) {
        obj[field] = value;    
    } else {
        const arrInfo = arrFieldInfo(field);
        let arr = obj[arrInfo.fieldName];
        if (!arr) {
            arr = obj[arrInfo.fieldName] = [];
        }
        arr[arrInfo.index] = value;
    }
}

export function getFlatField(fieldPath: string, obj: { [x: string]: any }) {
    if (!obj) {
        return;
    }

    let ret;

    const firstDotPos = fieldPath.indexOf(DOT);
    if (firstDotPos !== -1) {
        const head = fieldPath.substring(0, firstDotPos);
        const tail = fieldPath.substring(firstDotPos + 1);
        return getFlatField(tail, getLeafField(head, obj));
    } else {
        return getLeafField(fieldPath, obj);
    }

    return ret;
}

function getLeafField(field: string, obj: { [x: string]: any }) {
    if (!obj) {
        return;
    }

    if (!isArr(field)) {
        return obj[field];    
    } else {
        const arrInfo = arrFieldInfo(field);
        const arr = obj[arrInfo.fieldName];
        if (!arr)
            return;
        else 
            return arr[arrInfo.index];
    }
}

function isArr(field: string) {
    return field.includes(ARR_OPEN_PAREN) && field.endsWith(ARR_CLOSE_PAREN);
}

function arrFieldInfo(field: string): { fieldName: string, index: string} {
    const toks = field.split(ARR_OPEN_PAREN);
    const fieldName =  toks[0];
    const tail = toks[1];
    const index = tail.substring(0, tail.length -1)
    return {
        fieldName: fieldName,
        index: index,
    };
}
