import { useState, useEffect } from "react";

const FinanceSimulator = () => {
  const [inputs, setInputs] = useState({
    tuition: 7500,
    housing: 600,
    food: 250,
    transport: 50,
    leisure: 100,
    savings: 2000,
    parents: 300,
    scholarship: 0,
    job: 0,
  });

  const [results, setResults] = useState({
    totalExpenses: 0,
    totalIncome: 0,
    balance: 0,
    monthlyNeed: 0,
  });

  useEffect(() => {
    const months = 10;

    const monthlyExpenses =
      parseFloat(inputs.housing) +
      parseFloat(inputs.food) +
      parseFloat(inputs.transport) +
      parseFloat(inputs.leisure);

    const annualExpenses =
      parseFloat(inputs.tuition) + monthlyExpenses * months;

    const monthlyIncome =
      parseFloat(inputs.parents) +
      parseFloat(inputs.scholarship) +
      parseFloat(inputs.job);

    const annualIncome = parseFloat(inputs.savings) + monthlyIncome * months;

    const balance = annualIncome - annualExpenses;

    setResults({
      totalExpenses: annualExpenses,
      totalIncome: annualIncome,
      balance: balance,
      monthlyNeed: monthlyExpenses,
    });
  }, [inputs]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({
      ...prev,
      [name]: value === "" ? 0 : parseFloat(value),
    }));
  };

  const getBarColor = (percentage) => {
    if (percentage > 100) return "#dc3545";
    if (percentage > 80) return "#ffc107";
    return "#28a745";
  };

  const expensesPercentage =
    results.totalIncome > 0
      ? (results.totalExpenses / results.totalIncome) * 100
      : 100;

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h2 style={styles.title}>Simulateur de Budget Étudiant</h2>
        <p style={styles.subtitle}>
          Anticipez vos dépenses et vérifiez la viabilité de votre projet
          d'études.
        </p>
      </header>

      <div style={styles.grid}>
        <div style={styles.column}>
          <div style={styles.card}>
            <h3 style={styles.sectionTitle}>💸 Dépenses (sur 10 mois)</h3>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Frais de scolarité (Annuel)</label>
              <div style={styles.inputWrapper}>
                <input
                  type="number"
                  name="tuition"
                  value={inputs.tuition}
                  onChange={handleChange}
                  style={styles.input}
                />
                <span style={styles.unit}>€</span>
              </div>
            </div>

            <h4 style={styles.subTitle}>Coût de la vie (Mensuel)</h4>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Loyer & Charges</label>
              <div style={styles.rangeWrapper}>
                <input
                  type="range"
                  name="housing"
                  min="0"
                  max="1500"
                  step="50"
                  value={inputs.housing}
                  onChange={handleChange}
                  style={styles.range}
                />
                <span style={styles.valueDisplay}>{inputs.housing} €</span>
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Alimentation</label>
              <div style={styles.rangeWrapper}>
                <input
                  type="range"
                  name="food"
                  min="100"
                  max="600"
                  step="10"
                  value={inputs.food}
                  onChange={handleChange}
                  style={styles.range}
                />
                <span style={styles.valueDisplay}>{inputs.food} €</span>
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Transport</label>
              <div style={styles.rangeWrapper}>
                <input
                  type="range"
                  name="transport"
                  min="0"
                  max="200"
                  step="5"
                  value={inputs.transport}
                  onChange={handleChange}
                  style={styles.range}
                />
                <span style={styles.valueDisplay}>{inputs.transport} €</span>
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Loisirs & Sorties</label>
              <div style={styles.rangeWrapper}>
                <input
                  type="range"
                  name="leisure"
                  min="0"
                  max="500"
                  step="10"
                  value={inputs.leisure}
                  onChange={handleChange}
                  style={styles.range}
                />
                <span style={styles.valueDisplay}>{inputs.leisure} €</span>
              </div>
            </div>
          </div>

          <div style={styles.card}>
            <h3 style={styles.sectionTitle}>💰 Ressources</h3>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Épargne de départ (Total)</label>
              <div style={styles.inputWrapper}>
                <input
                  type="number"
                  name="savings"
                  value={inputs.savings}
                  onChange={handleChange}
                  style={styles.input}
                />
                <span style={styles.unit}>€</span>
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Aide parentale (Mensuel)</label>
              <div style={styles.inputWrapper}>
                <input
                  type="number"
                  name="parents"
                  value={inputs.parents}
                  onChange={handleChange}
                  style={styles.input}
                />
                <span style={styles.unit}>€/mois</span>
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Bourses / APL (Mensuel)</label>
              <div style={styles.inputWrapper}>
                <input
                  type="number"
                  name="scholarship"
                  value={inputs.scholarship}
                  onChange={handleChange}
                  style={styles.input}
                />
                <span style={styles.unit}>€/mois</span>
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Job étudiant (Mensuel)</label>
              <div style={styles.inputWrapper}>
                <input
                  type="number"
                  name="job"
                  value={inputs.job}
                  onChange={handleChange}
                  style={styles.input}
                />
                <span style={styles.unit}>€/mois</span>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.column}>
          <div style={styles.resultCard}>
            <h3 style={styles.sectionTitle}>Analyse Financière</h3>

            <div style={styles.summaryItem}>
              <span>Budget Total Nécessaire</span>
              <span style={styles.bigNumber}>
                {results.totalExpenses.toLocaleString()} €
              </span>
            </div>

            <div style={styles.summaryItem}>
              <span>Ressources Totales</span>
              <span style={{ ...styles.bigNumber, color: "#007bff" }}>
                {results.totalIncome.toLocaleString()} €
              </span>
            </div>

            <hr style={styles.separator} />

            <div style={styles.summaryItem}>
              <span>Solde Fin d'Année</span>
              <span
                style={{
                  ...styles.bigNumber,
                  color: results.balance >= 0 ? "#28a745" : "#dc3545",
                }}
              >
                {results.balance > 0 ? "+" : ""}
                {results.balance.toLocaleString()} €
              </span>
            </div>

            <div style={styles.gaugeContainer}>
              <div style={styles.gaugeLabel}>
                <span>Taux de couverture</span>
                <span>
                  {Math.min(expensesPercentage, 100).toFixed(0)}% utilisé
                </span>
              </div>
              <div style={styles.gaugeBg}>
                <div
                  style={{
                    ...styles.gaugeFill,
                    width: `${Math.min(expensesPercentage, 100)}%`,
                    backgroundColor: getBarColor(expensesPercentage),
                  }}
                ></div>
              </div>
            </div>

            {results.balance < 0 ? (
              <div style={styles.alertBox}>
                ⚠️ <strong>Attention :</strong> Votre budget est déficitaire de{" "}
                {Math.abs(results.balance)} €.
                <br />
                Envisagez un prêt étudiant ou réduisez vos dépenses de logement.
              </div>
            ) : (
              <div style={styles.successBox}>
                ✅ <strong>Bravo :</strong> Votre plan de financement semble
                solide !
              </div>
            )}

            <button style={styles.printBtn} onClick={() => window.print()}>
              🖨️ Imprimer mon budget
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    maxWidth: "1000px",
    margin: "0 auto",
  },
  header: {
    textAlign: "center",
    marginBottom: "30px",
  },
  title: {
    color: "#2c3e50",
    marginBottom: "10px",
  },
  subtitle: {
    color: "#7f8c8d",
  },
  grid: {
    display: "flex",
    gap: "30px",
    flexWrap: "wrap",
  },
  column: {
    flex: 1,
    minWidth: "300px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  card: {
    backgroundColor: "#fff",
    padding: "25px",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  },
  resultCard: {
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "10px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
    position: "sticky",
    top: "20px",
  },
  sectionTitle: {
    marginTop: 0,
    marginBottom: "20px",
    color: "#333",
    borderBottom: "1px solid #eee",
    paddingBottom: "10px",
  },
  subTitle: {
    fontSize: "0.95rem",
    color: "#666",
    marginTop: "20px",
    marginBottom: "15px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  inputGroup: {
    marginBottom: "15px",
  },
  label: {
    display: "block",
    marginBottom: "5px",
    fontSize: "0.9rem",
    color: "#555",
  },
  inputWrapper: {
    display: "flex",
    alignItems: "center",
    border: "1px solid #ddd",
    borderRadius: "4px",
    overflow: "hidden",
  },
  input: {
    flex: 1,
    padding: "8px",
    border: "none",
    fontSize: "1rem",
    outline: "none",
  },
  unit: {
    padding: "8px 12px",
    backgroundColor: "#f8f9fa",
    borderLeft: "1px solid #ddd",
    color: "#666",
    fontSize: "0.9rem",
  },
  rangeWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },
  range: {
    flex: 1,
    cursor: "pointer",
  },
  valueDisplay: {
    width: "70px",
    textAlign: "right",
    fontWeight: "bold",
    color: "#007bff",
  },
  summaryItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
  },
  bigNumber: {
    fontSize: "1.4rem",
    fontWeight: "bold",
    color: "#333",
  },
  separator: {
    border: "none",
    borderTop: "1px solid #eee",
    margin: "20px 0",
  },
  gaugeContainer: {
    marginTop: "20px",
    marginBottom: "20px",
  },
  gaugeLabel: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "5px",
    fontSize: "0.85rem",
    color: "#666",
  },
  gaugeBg: {
    height: "10px",
    backgroundColor: "#e9ecef",
    borderRadius: "5px",
    overflow: "hidden",
  },
  gaugeFill: {
    height: "100%",
    transition: "width 0.3s ease, background-color 0.3s",
  },
  alertBox: {
    backgroundColor: "#f8d7da",
    color: "#721c24",
    padding: "15px",
    borderRadius: "5px",
    fontSize: "0.9rem",
    lineHeight: "1.4",
    marginBottom: "20px",
  },
  successBox: {
    backgroundColor: "#d4edda",
    color: "#155724",
    padding: "15px",
    borderRadius: "5px",
    fontSize: "0.9rem",
    marginBottom: "20px",
  },
  printBtn: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#343a40",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "1rem",
  },
};

export default FinanceSimulator;
