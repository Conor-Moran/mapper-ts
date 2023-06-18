export function main() {
    //console.log(map(source, fieldMap));
    //p(data, trio);
    //console.log(trio);
    console.log(doMap());
};

const source = {
    oper: {
        isMain: true,
        givenName: 'Jim',
        familyName: 'Beam',
        numbers: [
            123,
            234
        ]
    }
}

function deflate(obj: { [x: string]: any; }, prefix = ''): { [x: string]: any;  } {
    return Object.keys(obj).reduce((acc, k) => {
        let fieldPrefix = '';
        if (prefix.length) {
            fieldPrefix = `${prefix}.`;
        }
        if (isNestedObj(obj[k])) Object.assign(acc, deflate(obj[k], fieldPrefix + k));
        else acc[fieldPrefix + k] = obj[k];
        return acc;
    }, {} as { [x: string]: any; });
}

function isNestedObj(obj: any) {
    return !Array.isArray(obj) && obj === Object(obj);
}

function inflate(obj: { [x: string]: any; }, prefix = '') {
    const inflated: { [x: string]: any; } = {};
    Object.keys(obj).forEach((fieldPath: string) => {
        const fields = fieldPath.split('.');
        let referencedObj = inflated;
        fields.forEach((field, index) => {
            if (index + 1 === fields.length) {
                let valueToUse = obj[fieldPath];
                if (Array.isArray(valueToUse)) {
                    const arr = [...valueToUse];
                    valueToUse = arr;
                }
                referencedObj[field] = valueToUse;
            } else if (!referencedObj[field]) {
                referencedObj[field] = {};
            }
            referencedObj = referencedObj[field];
        });
    });
    return inflated;
}

const fieldMap: [string, string][] = [
    ['oper.givenName', 'debtorAcc.agent.firstName'],
    ['oper.familyName', 'debtorAcc.agent.lastName'],
    ['oper.numbers', 'debtorAcc.agent.nums'],
];

function map(obj: any, fieldMap: FieldMap) {
    const deflatedSrc = deflate(obj);
    const deflatedTarget: { [x: string]: any; } = {};
    Object.keys(fieldMap).forEach( key => {
        deflatedTarget[fieldMap[key]] = deflatedSrc[key];
    });
    return inflate(deflatedTarget);
}

class Trio {
    constructor(
        private person1: Person,
        private person2: Person,
        private person3: Person,
      ) {}
}

class Person {
    constructor(
        private firstName: string | null,
        private lastLast: string | null,
        private homeAddr: Address,
        private workAddr: Address,
      ) {}
}

class Address {
    constructor(
        private line1: string | null,
        private line2: string | null,
        private city: string | null,
      ) {}
}

const trio = new Trio(
    new Person(null, null, new Address(null, null, null), new Address(null, null, null)),
    new Person(null, null, new Address(null, null, null), new Address(null, null, null)),
    new Person(null, null, new Address(null, null, null), new Address(null, null, null))
);


const data = {
    debtors: {
        debtorAgt1: {
            givenName: 'John',
            familyName: 'Smith',
            postalAddr: {
                ln1: '25 The Beeches',
                cityName: 'New York'
            }
        },
        debtorAgt2: {
            givenName: 'Jane',
            familyName: 'Warrick',
            postalAddr: {
                ln1: '1230 Pennybrook Lane',
                cityName: 'London'
            }

        },
        debtorAgt3: {
            givenName: 'Lou',
            familyName: 'Greene',
            postalAddr: {
                ln1: '102 Long Street',
                cityName: 'Paris'
            }
        },
    }
};

type FieldMap = {[x: string]: string};

const masterFieldMap = {
    'static': '',
    'creditors': 'creds',
    'debtors': 'debs',
} as FieldMap;

const trioFieldMap = {
    'debtors.debtorAgt1': 'person1',
    'debtors.debtorAgt2': 'person2',
    'debtors.debtorAgt3': 'person3',
 } as FieldMap;

const addrFieldMap = {
    'l1': 'line1',
    'l2': 'line2',
    'cityName': 'city',
} as FieldMap;

const personFieldMap = {
    'givenName': 'firstName',
    'familyName': 'lastName',
} as FieldMap;

class Builder {

    masterFieldMap: FieldMap = {};

    constructor(masterFieldMap: FieldMap) {
        Object.assign(this.masterFieldMap, masterFieldMap);
    }

    meld_append(map1: FieldMap, map2: FieldMap): Builder {
        const melded = {} as FieldMap;

        Object.keys(map1).forEach(key => {
            Object.keys(map2).forEach(subKey => {
                melded[`${key}.${subKey}`]  = `${map1[key]}.${map2[subKey]}`;
            });
        });
        Object.assign(this.masterFieldMap, melded);
        return this;
    }

    final() {
        return this.masterFieldMap;
    }
}

function doMap() {
    const partyFieldMap = new Builder(personFieldMap);
    partyFieldMap.meld_append({
        'workAddr': 'postalAddr'
    }, addrFieldMap);
    
    const builder = new Builder(masterFieldMap);
    builder.meld_append({
        'creditors.agent': 'creds.agt',
        'creditors.party1': 'creds.person1',
        'creditors.party2': 'creds.person1',
        'debtors.agent': 'creds.agt',
        'debtors.party1': 'creds.person1',
        'debtors.party2': 'creds.person2',
    }, partyFieldMap.final());

    return builder.final();
}