import './App.css';
import { Formula } from './Formula';  // ← Use curly braces for named export
import React, {useEffect, useRef, useState} from 'react';
import FormulaButton from "./FormulaButton";
import FormulaSelection from "./FormulaSelection";

function App() {
    const [formulas, setFormulas] = useState([Formula.createOne()]);
    const bottomRef = useRef(null);

    function getCurrentFormula() {
        return formulas[formulas.length - 1];
    }

    const restartWithFormula = (formula) => {
        setFormulas([formula]);
    }

    const clickButton = (variableValue) => {
        let oldFormula = getCurrentFormula();
        let variable = oldFormula.getNextQuantifier().symbol;
        oldFormula.assignValue(variable, variableValue);
        let newFormula = oldFormula.copyAndRemoveVariable(variableValue);

        setFormulas([...formulas, newFormula]);
    };

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'instant' });
    }, [formulas]);

    const winnerMessage = () => {
        if (getCurrentFormula().isUnsatisfiable || getCurrentFormula().isTautology) {
            if (getCurrentFormula().isUnsatisfiable) {
                return <div style={{ marginLeft: '20px', marginRight: '20px', color: '#0eb319' }}>
                    Winner: ∀ Player
                </div>
            }
            return <div style={{ marginLeft: '20px', marginRight: '20px', color: '#e63737' }}>
                Winner: ∃ Player
            </div>
        }
    }

    return (
        <div className="App">
            <header className="App-header">

                <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                    <FormulaSelection
                        restartWithFormula={restartWithFormula}
                    />
                </div>

                <h1>QBF Game</h1>
                <div style={{
                    display: 'flex',
                    position: 'relative',
                    width: '100%',
                    marginBottom: '10px',
                    fontWeight: 'bold',
                    fontSize: '20px'
                }}>
                    <div style={{ position: 'absolute', left: '20%', transform: 'translateX(-50%)', color: '#e63737' }}>
                        ∃ Player
                    </div>
                    <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
                        Formula
                    </div>
                    <div style={{ position: 'absolute', left: '80%', transform: 'translateX(-50%)', color: '#0eb319' }}>
                        ∀ Player
                    </div>
                </div>



                {formulas.map((formula, index) => (
                    <div key={index} style={{
                        display: 'flex',
                        position: 'relative',
                        width: '100%',
                        alignItems: 'center',
                        margin: '20px 0',
                        minHeight: '40px'
                    }}>
                        {/* Player E buttons */}
                        <div style={{ position: 'absolute', left: '20%', transform: 'translateX(-50%)' }}>
                            <FormulaButton
                                formula={formula}
                                currentFormula={getCurrentFormula()}
                                onClick={clickButton}
                                existsPlayer={true}
                            />
                        </div>

                        {/* Formula */}
                        <div style={{
                            position: 'absolute',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            fontSize: '24px',
                            whiteSpace: 'pre'
                        }}>
                            {formula.render()}
                        </div>

                        {/* Player A buttons */}
                        <div style={{ position: 'absolute', left: '80%', transform: 'translateX(-50%)' }}>
                            <FormulaButton
                                formula={formula}
                                currentFormula={getCurrentFormula()}
                                onClick={clickButton}
                                existsPlayer={false}
                            />
                        </div>

                    </div>
                ))}

                {
                    (getCurrentFormula().isTautology || getCurrentFormula().isUnsatisfiable) && winnerMessage()
                }

                <div ref={bottomRef} />

            </header>

        </div>
    );
}

export default App;