import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PollTrigger from "./Poll.jsx";
import "./App.css";

function Home() {
  return <h1 className="text-3xl font-bold mb-6">Slack Poll App</h1>;
}

function App() {
  return (
    <Router>
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <Routes>
          {/* <Route path="/" element={<Home />} /> */}
          <Route path="/" element={<PollTrigger />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
