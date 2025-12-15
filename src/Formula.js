export const colors = {
    baseWhite: "#ffffff",
    baseDark: "#000000",
    selectedLiteral: "#ffa500",
    quantifierE: "#e63737",
    quantifierA: "#0eb319",
};

class Literal {
    constructor(symbol, negated) {
        this.symbol = symbol;
        this.negated = negated;
    }

    render(selectedVariable, whiteMode) {
        let string = this.negated ? "¬" : "";
        string += this.symbol;
        if (selectedVariable === this.symbol) {
            return <span style={{ color: colors.selectedLiteral }}>
          {string}
        </span>
        }
        return <span style={{ color: whiteMode ? colors.baseWhite : colors.baseDark }}>
          {string}
        </span>
    }
}

class Clause {
    constructor(literalList) {
        this.literalList = literalList;
    }

    containsPositiveLiteral(symbol) {
        for (let literal of this.literalList) {
            if (!literal.negated && literal.symbol === symbol) {
                return true;
            }
        }
        return false;
    }

    containsNegativeLiteral(symbol) {
        for (let literal of this.literalList) {
            if (literal.negated && literal.symbol === symbol) {
                return true;
            }
        }
        return false;
    }

    copyWithout(symbol) {
        let list = [];
        this.literalList.forEach(literal => {
            if (literal.symbol === symbol) {
                return;
            }
            list.push(literal);
        });
        return new Clause(list);
    }

    render(selectedVariable, whiteMode) {
        return (
            <span style={{ color: whiteMode ? colors.baseWhite : colors.baseDark }}>
                (
                {this.literalList.map((lit, i) => (
                    <span key={i}>
                        {lit.render(selectedVariable, whiteMode)}
                        {i < this.literalList.length - 1 &&
                            <span key={i} style={{ color: whiteMode ? colors.baseWhite : colors.baseDark }}> ∨ </span>
                        }
                    </span>
                ))}
                )
            </span>
        );
    }
}

class Quantifier {
    constructor(exists, symbol) {
        this.exists = exists;
        this.symbol = symbol;
    }

    render(key, selectedVariable, whiteMode) {
        let quantString = this.exists ? "∃" : "∀";
        let isSelected = selectedVariable === this.symbol;
        let color = whiteMode ? colors.baseWhite : colors.baseDark;
        if (isSelected) {
            color = this.exists ? colors.quantifierE : colors.quantifierA;
        }
        return (
            <span key={key} style={{  }}>
                <span style={{ color: color }}>
                    {quantString}
                </span>

                <span style={{ color: color }}>
                    {this.symbol}
                </span>
            </span>
        )

    }
}

export class Formula {
    constructor(quantifiers, clauses) {
        this.quantifiers = quantifiers;
        this.clauses = clauses;
        this.assignedValue = null;
    }

    assignValue(variable, value) {
        this.assignedValue = {variable: variable, value: value};
    }

    copyAndRemoveVariable(variableValue) {
        let newFormula = new Formula();
        let removedQuantifier = this.quantifiers[0];
        let removedVariable = removedQuantifier.symbol;

        newFormula.quantifiers = [...this.quantifiers.slice(1)];
        let clauses = [];
        let isUnsatisfiable = false;
        this.clauses.forEach(clause => {
            // Skip clause if it contains variable and it is set to true
            if (variableValue) {
                if (clause.containsPositiveLiteral(removedVariable)) {
                    return;
                }
            }
            // Skip clause if it contains negated variable and it is set to false
            if (!variableValue) {
                if (clause.containsNegativeLiteral(removedVariable)) {
                    return;
                }
            }

            // All remaining literals of that variable compute false. We can remove them
            let newClause = clause.copyWithout(removedVariable);

            if (newClause.literalList.length > 0) {
                clauses.push(newClause);
            } else {
                // Empty clause is defined as unsatisfiable clause. Which makes sense, because we remove all literals
                // assigned to "False"
                clauses.push(new Clause([new Literal('□', false)]));
                isUnsatisfiable = true;
            }
        });
        newFormula.assignedValue = null;
        newFormula.isUnsatisfiable = isUnsatisfiable;
        newFormula.isTautology = clauses.length === 0;
        if (newFormula.isTautology) {
            clauses.push(new Clause([new Literal('True', false)]));
        }
        newFormula.clauses = clauses;

        return newFormula;
    }

    static createOne() {
        let quantList = [];
        quantList.push(new Quantifier(true, 'a'));
        quantList.push(new Quantifier(false, 'b'));
        quantList.push(new Quantifier(false, 'c'));
        quantList.push(new Quantifier(false, 'd'));

        let clauses = [];
        function lit(s, neg) {
            return new Literal(s, neg);
        }

        clauses.push(new Clause([lit('a', false), lit('b', false), lit('b', true)]));
        clauses.push(new Clause([lit('d', false), lit('b', false)]));

        return new Formula(quantList, clauses);
    }

    getNextQuantifier() {
        return this.quantifiers[0];
    }

    render(noneSelected = false, whiteMode = true) {
        let selectedVariable = noneSelected ? null : this.quantifiers[0]?.symbol;
        return (
            <span>
                {this.quantifiers.map((quant, i) => (quant.render(i, selectedVariable, whiteMode)))}
                <span>&nbsp;&nbsp;&nbsp;</span>
                {this.clauses.map((clause, i) => (
                    <span key={i}>
                        {clause.render(selectedVariable, whiteMode)}
                        {i < this.clauses.length - 1 && (
                            <span style={{ color: whiteMode ? colors.baseWhite : colors.baseDark }}> ∧ </span>
                        )}
                    </span>
                ))}
            </span>
        )
    }
}

export function createFormulaFromString(formulaString) {
    let quantList = [];
    let i = 0;
    while (i < formulaString.length) {
        let s = formulaString[i];
        if (s === ' ') {
            i++;
            continue;
        }
        if (s === '(' ) {
            break;
        }

        // Illegal Formula
        if (s !== 'A' && s !== 'E') {
            return null;
        }
        i++;

        let variable = extractVariable(formulaString, i);
        i = variable.i;
        quantList.push(new Quantifier(s === 'E', variable.varName));
    }

    let clauses = [];
    while (i < formulaString.length) {
        let s = formulaString[i];
        if (s === ' ' || s === '∧') {
            i++;
            continue;
        }

        // Illegal Formula
        if (s !== '(') {
            return null;
        }
        i++;

        let literalList = [];
        let negated = false;
        while (i < formulaString.length) {
            s = formulaString[i];
            if (s === ')') {
                i++;
                break;
            }

            if (s === ' ') {
                i++;
                continue;
            }

            negated = s === '-' || s === '¬';
            if (negated) {
                i++;
                s = formulaString[i];
            }

            let variable = extractVariable(formulaString, i);
            if (variable.varName.length === 0) {
                i++;
                continue;
            }
            i = variable.i;

            literalList.push(new Literal(variable.varName, negated));
        }
        clauses.push(new Clause(literalList));
    }

    return new Formula(quantList, clauses);
}

function extractVariable(string, i) {
    let varName = "";
    while (i < string.length) {
        let s = string[i];
        //console.log("Next var char: " + s);
        if (s === ' ' || s === 'A' || s === 'E' || s === '∨' || s === '¬' || s === '∧' || s === '(' || s === ')') {
            //console.log("Reading variable Name. Encountered: " + s);
            break;
        }
        i++;
        varName += s;
    }
    return {varName, i};
}

export default Formula;