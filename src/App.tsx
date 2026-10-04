import { useEffect } from "react";
import Meridian from "./Meridian";

export default function App() {
  useEffect(() => {
    document.title = "Meridian — Orbital Imaging Network";
  }, []);

  return <Meridian />;
}
