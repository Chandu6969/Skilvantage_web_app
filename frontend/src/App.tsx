import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import Home from "@/pages/Home";
import Programs from "@/pages/Programs";
import ProgramDetail from "@/pages/ProgramDetail";
import Roadmaps from "@/pages/Roadmaps";
import Projects from "@/pages/Projects";
import JobReady from "@/pages/JobReady";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Register from "@/pages/Register";
import RegisterSuccess from "@/pages/RegisterSuccess";
import Admin from "@/pages/Admin";

// One <Route> per page in src/pages; BrowserRouter already wraps this in main.tsx.
export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/programs" element={<Programs />} />
        <Route path="/programs/:slug" element={<ProgramDetail />} />
        <Route path="/roadmaps" element={<Roadmaps />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/job-ready" element={<JobReady />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/register" element={<Register />} />
        <Route path="/registration-success" element={<RegisterSuccess />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Home />} />
      </Routes>
      <Toaster richColors />
    </>
  );
}
