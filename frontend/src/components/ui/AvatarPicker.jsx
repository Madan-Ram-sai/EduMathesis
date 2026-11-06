import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Camera, Plus } from "lucide-react";

const types = ["image/jpeg", "image/png", "image/webp"];

export default function AvatarPicker({ file, onChange, onError }) {
  const ref = useRef(null);
  const [url, setUrl] = useState(null);

  useEffect(() => {
    if (!file) return setUrl(null);
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);

  const pick = (e) => {
    const f = e.target.files[0];
    e.target.value = "";
    if (!f) return;
    if (!types.includes(f.type)) return onError("Use a JPG, PNG or WEBP image");
    if (f.size > 5 * 1024 * 1024) return onError("Image must be under 5 MB");
    onError("");
    onChange(f);
  };

  return (
    <div className="avatar-pick">
      <motion.button
        type="button"
        className="ring"
        whileHover={{ rotate: -5, scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => ref.current.click()}
        aria-label="Choose profile photo"
      >
        {url ? <img src={url} alt="Your avatar preview" /> : <Camera size={28} />}
        <span className="plus"><Plus size={14} /></span>
      </motion.button>
      <input ref={ref} type="file" accept={types.join(",")} hidden onChange={pick} />
      <div>
        <b>Profile photo</b>
        <small>
          {file ? <button type="button" className="linkish" onClick={() => onChange(null)}>Remove</button> : "Optional · JPG, PNG or WEBP · 5 MB"}
        </small>
      </div>
    </div>
  );
}