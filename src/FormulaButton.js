import {colors} from "./Formula";

function FormulaButton({ formula, currentFormula, onClick, existsPlayer }) {

    if (formula.assignedValue !== null && formula.getNextQuantifier()?.exists === existsPlayer) {
        return <div style={{ marginLeft: 20, marginRight: 20 }}>
            {`${formula?.assignedValue?.variable} → ${
                formula?.assignedValue?.value ? 'True' : 'False'
            }`}
        </div>
    }

    // Only deal with the current formula from now on
    if (formula !== currentFormula) {
        return <div style={{ marginLeft: '20px', marginRight: '20px' }}>
            {null}
        </div>
    }

    // Game ended - no more buttons
    if (currentFormula.isUnsatisfiable || currentFormula.isTautology) {
        return <div style={{ marginLeft: '20px', marginRight: '20px' }}>
            {null}
        </div>
    }

    let nextQuantifier = currentFormula.getNextQuantifier();
    // Only buttons for the current player
    if (existsPlayer !== nextQuantifier?.exists) {
        return <div style={{ marginLeft: '20px', marginRight: '20px' }}>
            {null}
        </div>
    }

    return (
        <div style={{ marginLeft: '20px', marginRight: '20px' }}>
            <span style={{ marginLeft: '20px' }}>Set  </span>
            <span style={{ marginRight: '20px', color: colors.selectedLiteral }}>{nextQuantifier.symbol} </span>
            <button onClick={() => onClick(true)}>True</button>
            <span style={{ marginLeft: '5px' }}> </span>
            <button onClick={() => onClick(false)}>False</button>
        </div>
    );
}

export default FormulaButton;