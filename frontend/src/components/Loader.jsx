const Loader = () => {
  return (
    <div style={styles.container}>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <div style={styles.spinner}></div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    padding: "20px",
    minHeight: "200px",
  },
  spinner: {
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #007bff",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    animation: "spin 1s linear infinite",
  },
};

export default Loader;
