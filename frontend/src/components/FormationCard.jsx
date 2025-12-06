const FormationCard = ({ formation, onClick }) => {
  const { title, description, price, duration, image } = formation;

  return (
    <div style={styles.card}>
      <img
        src={image || "https://via.placeholder.com/300x200?text=Cours"}
        alt={title}
        style={styles.image}
      />

      <div style={styles.content}>
        <h3 style={styles.title}>{title}</h3>
        <p style={styles.description}>{description}</p>

        <div style={styles.footer}>
          <div style={styles.meta}>
            <span>⏱ {duration}</span>
            <span style={styles.price}>{price} €</span>
          </div>

          <button style={styles.button} onClick={() => onClick(formation.id)}>
            Voir le cours
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  card: {
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    overflow: "hidden",
    backgroundColor: "#fff",
    transition: "transform 0.2s, box-shadow 0.2s",
    display: "flex",
    flexDirection: "column",
    maxWidth: "350px",
    margin: "10px",
  },
  image: {
    width: "100%",
    height: "200px",
    objectFit: "cover",
  },
  content: {
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    flex: 1,
  },
  title: {
    margin: "0 0 8px 0",
    fontSize: "1.25rem",
    color: "#333",
  },
  description: {
    fontSize: "0.9rem",
    color: "#666",
    margin: "0 0 16px 0",
    lineHeight: "1.4",
    flex: 1,
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "auto",
  },
  meta: {
    display: "flex",
    flexDirection: "column",
    fontSize: "0.85rem",
    color: "#555",
  },
  price: {
    fontWeight: "bold",
    fontSize: "1rem",
    color: "#2c3e50",
    marginTop: "4px",
  },
  button: {
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    padding: "8px 16px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.9rem",
  },
};

export default FormationCard;
