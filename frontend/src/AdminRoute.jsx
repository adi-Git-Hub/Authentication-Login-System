useEffect(() => {
  if (!token || role !== "admin") {
    navigate("/login");
  }
}, []);

