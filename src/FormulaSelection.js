import {useEffect, useRef, useState} from 'react';
import {createFormulaFromString} from "./Formula";

const formulas = [
    createFormulaFromString("EaAbAcEd (a ∨ b ∨ c) ∧ (-a ∨ b ∨ d) ∧ (b ∨ -c ∨ -d)"),
    createFormulaFromString("AxEyEt (x ∨ y) ∧ (-t ∨ x)"),
    createFormulaFromString("AxEyEz (x ∨ y ∨ z) ∧ (-z ∨ -x)"),
    createFormulaFromString("EaEbEc (a ∨ b) ∧ (-c ∨ -b)"),
];

function FormulaSelection({restartWithFormula}) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [customFormulaText, setCustomFormulaText] = useState('');
    const inputRef = useRef(null);

    const handleSelect = (formula) => {
        setIsOpen(false);
        restartWithFormula(formula);
    };

    const handleCustomFormulaSubmit = () => {
        try {
            const newFormula = createFormulaFromString(customFormulaText);
            handleSelect(newFormula);
            setShowCustomInput(false);
            setCustomFormulaText('');
            setIsOpen(false);
        } catch (error) {
            alert('Invalid formula: ' + error.message);
        }
    };

    const insertAtCursor = (textToInsert) => {
        const input = inputRef.current;
        if (!input) return;

        const start = input.selectionStart;
        const end = input.selectionEnd;
        const text = customFormulaText;

        // Insert the text at cursor position
        const newText = text.substring(0, start) + textToInsert + text.substring(end);
        setCustomFormulaText(newText);

        // Move cursor after inserted text
        setTimeout(() => {
            input.focus();
            input.setSelectionRange(start + textToInsert.length, start + textToInsert.length);
        }, 0);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <>
            <div ref={dropdownRef} style={{
                position: 'relative',
                fontSize: '15px'
            }}>
                <button onClick={() => setIsOpen(!isOpen)}>
                    Select Formula
                </button>

                {isOpen && (
                    <div style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        backgroundColor: 'white',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        marginTop: '4px',
                        minWidth: '150px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        zIndex: 1000,
                    }}>
                        {/* List of Presets */}
                        {formulas.map((formula, index) => (
                            formula &&
                            <div
                                key={index}
                                onClick={() => handleSelect(formula)}
                                style={{
                                    padding: '8px 12px',
                                    cursor: 'pointer',
                                    color: 'black',
                                    fontSize: '15px',
                                    whiteSpace: 'nowrap'
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                            >
                                {formula.render(true, false)}
                            </div>
                        ))}

                        {/* Enter custom Formula */}
                        <div
                            key={formulas.length}
                            onClick={() => {
                                setCustomFormulaText('EaAb(a ∨ b) ∧ (-b ∨ -a)');
                                setShowCustomInput(true);
                                setIsOpen(false);
                            }}
                            style={{
                                padding: '8px 12px',
                                cursor: 'pointer',
                                color: 'black',
                                fontSize: '15px',
                                whiteSpace: 'nowrap'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                        >
                            Enter Formula
                        </div>

                    </div>
                )}

                {/* Custom Formula Input */}
                {showCustomInput && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 2000
                    }}>
                        <div style={{
                            backgroundColor: 'white',
                            padding: '20px',
                            borderRadius: '8px',
                            minWidth: '300px',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
                        }}>
                            <h3 style={{ color: 'black', marginTop: 0 }}>Enter Custom Formula</h3>
                            <input
                                ref={inputRef}
                                type="text"
                                value={customFormulaText}
                                onChange={(e) => setCustomFormulaText(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    fontSize: '14px',
                                    marginBottom: '12px',
                                    boxSizing: 'border-box',
                                    color: 'black'
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleCustomFormulaSubmit();
                                    if (e.key === 'Escape') setShowCustomInput(false);
                                }}
                                autoFocus
                            />

                            {/* And/Or Buttons */}
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-start' }}>
                                <button onClick={() => insertAtCursor('∧')}>
                                    ∧
                                </button>
                                <button onClick={() => insertAtCursor('∨')}>
                                    ∨
                                </button>
                            </div>

                            {/* Submit/Cancel Buttons */}
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                <button onClick={() => setShowCustomInput(false)}>
                                    Cancel
                                </button>
                                <button onClick={handleCustomFormulaSubmit}>
                                    Submit
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default FormulaSelection;