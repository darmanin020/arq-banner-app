import { useState, useRef, useEffect, useCallback } from "react";

const LOGO_COLOR_SRC = "/arq-logo-colour.png.png";
const LOGO_WHITE_SRC = "/arq-logo-white.png.png";

const BRAND = {
  deepBlue: "#0D2D6C",
  aqua: "#00CDEF",
  green: "#AEED4A",
  white: "#FFFFFF",
  grey: "#808285",
  fontFamily: "Barlow",
};

const SIZES = {
  instagram: { width: 1080, height: 1350, label: "Instagram", dimensions: "1080 × 1350", layout: "portrait" },
  linkedin:  { width: 1080, height: 1080, label: "LinkedIn",  dimensions: "1080 × 1080", layout: "square"   },
  facebook:  { width: 1080, height: 1080, label: "Facebook",  dimensions: "1080 × 1080", layout: "square"   },
};

const STYLES = {
  aquaBlob:     { label: "Aqua Blob",    description: "White bg · aqua blob top-right · curved panel", dark: false },
  darkSplit:    { label: "Dark Split",   description: "Photo left · blue right · text on right side",   dark: true  },
  lightPattern: { label: "Hex Pattern",  description: "White bg · hex grid top · photo bottom",         dark: false },
  fullBleed:    { label: "Full Bleed",   description: "Photo fills canvas · gradient overlay",          dark: true  },
  bottomPhoto:  { label: "Bottom Photo", description: "Blue top · photo bottom with curved edge",       dark: true  },
  sideOverlay:  { label: "Side Overlay", description: "Solid blue bar left · aqua accent line",        dark: true  },
};

function coverFit(img, zoneW, zoneH, yBias = 0.33) {
  const ir = img.width / img.height, zr = zoneW / zoneH;
  let sx, sy, sw, sh;
  if (ir > zr) { sh = img.height; sw = sh * zr; sx = (img.width - sw) / 2; sy = 0; }
  else         { sw = img.width;  sh = sw / zr; sx = 0; sy = (img.height - sh) * yBias; }
  return { sx, sy, sw, sh };
}

function drawAquaBlob(ctx, width, height, bgImage) {
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, width, height);
  ctx.save();
  ctx.fillStyle = BRAND.aqua;
  ctx.beginPath();
  ctx.moveTo(width, 0);
  ctx.lineTo(width * 0.40, 0);
  ctx.bezierCurveTo(width*0.55, height*0.07, width*0.70, height*0.16, width*0.66, height*0.36);
  ctx.bezierCurveTo(width*0.63, height*0.50, width*0.78, height*0.54, width, height*0.47);
  ctx.lineTo(width, 0);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  if (bgImage) {
    const px = width * 0.36, pw = width - px;
    const { sx, sy, sw, sh } = coverFit(bgImage, pw, height);
    ctx.drawImage(bgImage, sx, sy, sw, sh, px, 0, pw, height);
  }
  ctx.save();
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.moveTo(0, 0); ctx.lineTo(width * 0.50, 0);
  ctx.bezierCurveTo(width*0.58, height*0.22, width*0.58, height*0.68, width*0.48, height);
  ctx.lineTo(0, height); ctx.closePath(); ctx.fill();
  ctx.restore();
}

function drawDarkSplit(ctx, width, height, bgImage) {
  ctx.fillStyle = BRAND.deepBlue;
  ctx.fillRect(0, 0, width, height);
  if (bgImage) {
    const pw = width * 0.72;
    const { sx, sy, sw, sh } = coverFit(bgImage, pw, height, 0.25);
    ctx.drawImage(bgImage, sx, sy, sw, sh, 0, 0, pw, height);
  }
  ctx.save();
  ctx.fillStyle = BRAND.deepBlue;
  ctx.beginPath();
  ctx.moveTo(width, 0);
  ctx.lineTo(width * 0.54, 0);
  ctx.bezierCurveTo(width * 0.44, height * 0.28, width * 0.50, height * 0.62, width * 0.60, height);
  ctx.lineTo(width, height);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.strokeStyle = BRAND.aqua;
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(width * 0.54, 0);
  ctx.bezierCurveTo(width * 0.44, height * 0.28, width * 0.50, height * 0.62, width * 0.60, height);
  ctx.stroke();
  ctx.restore();
}

function drawHexPattern(ctx, width, height, bgImage) {
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, width, height);
  const cutLeft  = height * 0.52;
  const cutRight = height * 0.40;
  if (bgImage) {
    const photoH = height - cutRight;
    const { sx, sy, sw, sh } = coverFit(bgImage, width, photoH, 0.20);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, cutLeft);
    ctx.lineTo(width, cutRight);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(bgImage, sx, sy, sw, sh, 0, cutRight, width, photoH);
    ctx.restore();
  }
  ctx.save();
  ctx.strokeStyle = BRAND.aqua;
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(0, cutLeft);
  ctx.lineTo(width, cutRight);
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.globalAlpha = 0.08;
  ctx.strokeStyle = BRAND.aqua;
  ctx.lineWidth = 2;
  const hexSize = width * 0.038;
  const gridStartY = height * 0.02;
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 9; col++) {
      const hx = col * hexSize * 1.78 + (row % 2 === 0 ? 0 : hexSize * 0.89) - hexSize;
      const hy = gridStartY + row * hexSize * 1.55;
      if (hy < cutLeft) {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = (Math.PI / 3) * i - Math.PI / 6;
          i === 0
            ? ctx.moveTo(hx + hexSize * Math.cos(a), hy + hexSize * Math.sin(a))
            : ctx.lineTo(hx + hexSize * Math.cos(a), hy + hexSize * Math.sin(a));
        }
        ctx.closePath();
        ctx.stroke();
      }
    }
  }
  ctx.restore();
}

function drawFullBleed(ctx, width, height, bgImage) {
  ctx.fillStyle = BRAND.deepBlue;
  ctx.fillRect(0, 0, width, height);
  if (bgImage) {
    const { sx, sy, sw, sh } = coverFit(bgImage, width, height, 0.2);
    ctx.drawImage(bgImage, sx, sy, sw, sh, 0, 0, width, height);
  }
  const grad = ctx.createLinearGradient(0, height * 0.25, 0, height);
  grad.addColorStop(0,    "rgba(13,45,108,0)");
  grad.addColorStop(0.45, "rgba(13,45,108,0.82)");
  grad.addColorStop(1,    "rgba(13,45,108,0.97)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);
  const lGrad = ctx.createLinearGradient(0, 0, width * 0.6, 0);
  lGrad.addColorStop(0, "rgba(13,45,108,0.35)");
  lGrad.addColorStop(1, "rgba(13,45,108,0)");
  ctx.fillStyle = lGrad;
  ctx.fillRect(0, 0, width, height);
}

function drawBottomPhoto(ctx, width, height, bgImage) {
  ctx.fillStyle = BRAND.deepBlue;
  ctx.fillRect(0, 0, width, height);
  const splitY = height * 0.38;
  const photoH = height - splitY;
  if (bgImage) {
    const { sx, sy, sw, sh } = coverFit(bgImage, width, photoH, 0.15);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, splitY + height * 0.05);
    ctx.bezierCurveTo(width*0.30, splitY - height*0.06, width*0.70, splitY + height*0.06, width, splitY - height*0.01);
    ctx.lineTo(width, height); ctx.lineTo(0, height); ctx.closePath(); ctx.clip();
    ctx.drawImage(bgImage, sx, sy, sw, sh, 0, splitY, width, photoH);
    ctx.restore();
  }
  ctx.save();
  ctx.strokeStyle = BRAND.aqua; ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(0, splitY + height * 0.05);
  ctx.bezierCurveTo(width*0.30, splitY - height*0.06, width*0.70, splitY + height*0.06, width, splitY - height*0.01);
  ctx.stroke();
  ctx.restore();
}

function drawSideOverlay(ctx, width, height, bgImage) {
  ctx.fillStyle = BRAND.deepBlue;
  ctx.fillRect(0, 0, width, height);
  if (bgImage) {
    const px = width * 0.35, pw = width - px;
    const { sx, sy, sw, sh } = coverFit(bgImage, pw, height, 0.25);
    ctx.drawImage(bgImage, sx, sy, sw, sh, px, 0, pw, height);
  }
  ctx.fillStyle = BRAND.deepBlue;
  ctx.fillRect(0, 0, width * 0.44, height);
  ctx.save();
  ctx.strokeStyle = BRAND.aqua; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(width * 0.44, 0); ctx.lineTo(width * 0.44, height); ctx.stroke();
  ctx.restore();
  ctx.fillStyle = BRAND.aqua;
  ctx.fillRect(0, 0, width, 8);
  ctx.fillRect(0, height - 8, width, 8);
}

export default function ARQBannerGenerator() {
  const [jobTitle, setJobTitle]           = useState("HR Executive");
  const [imageUrl, setImageUrl]           = useState("");
  const [selectedSize, setSelectedSize]   = useState("instagram");
  const [selectedStyle, setSelectedStyle] = useState("aquaBlob");
  const [fontsReady, setFontsReady]       = useState(false);
  const [logosReady, setLogosReady]       = useState(false);
  const [imageError, setImageError]       = useState(false);
  const [imageSource, setImageSource]     = useState("");
  const [bgImage, setBgImage]             = useState(null);

  const canvasRef    = useRef(null);
  const fileInputRef = useRef(null);
  const logoColorRef = useRef(null);
  const logoWhiteRef = useRef(null);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Barlow:wght@400;600;700;900&display=swap";
    link.rel  = "stylesheet";
    document.head.appendChild(link);
    document.fonts.ready.then(() => setFontsReady(true));
  }, []);

  useEffect(() => {
    const loadImg = (src) => new Promise((resolve, reject) => {
      const img = new Image();
      img.onload  = () => resolve(img);
      img.onerror = () => reject(new Error("Could not load: " + src));
      img.src = src;
    });
    Promise.all([loadImg(LOGO_COLOR_SRC), loadImg(LOGO_WHITE_SRC)])
      .then(([colour, white]) => {
        logoColorRef.current = colour;
        logoWhiteRef.current = white;
        setLogosReady(true);
      })
      .catch(err => console.warn("Logo load error:", err));
  }, []);

  useEffect(() => {
    if (imageSource !== "url" || !imageUrl.trim()) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload  = () => { setBgImage(img); setImageError(false); };
    img.onerror = () => { setBgImage(null); setImageError(true); };
    img.src = "https://corsproxy.io/?" + encodeURIComponent(imageUrl);
  }, [imageUrl, imageSource]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => { setBgImage(img); setImageError(false); };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
    setImageSource("upload");
    setImageUrl("");
  };

  const clearImage = () => {
    setBgImage(null); setImageUrl(""); setImageSource(""); setImageError(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !fontsReady || !logosReady) return;
    const ctx = canvas.getContext("2d");
    const { width, height } = SIZES[selectedSize];
    canvas.width = width; canvas.height = height;
    const S = width / 1080;

    if      (selectedStyle === "aquaBlob")     drawAquaBlob(ctx, width, height, bgImage);
    else if (selectedStyle === "darkSplit")    drawDarkSplit(ctx, width, height, bgImage);
    else if (selectedStyle === "lightPattern") drawHexPattern(ctx, width, height, bgImage);
    else if (selectedStyle === "fullBleed")    drawFullBleed(ctx, width, height, bgImage);
    else if (selectedStyle === "bottomPhoto")  drawBottomPhoto(ctx, width, height, bgImage);
    else if (selectedStyle === "sideOverlay")  drawSideOverlay(ctx, width, height, bgImage);

    const isDark      = STYLES[selectedStyle].dark;
    const isDarkSplit = selectedStyle === "darkSplit";
    const textColor   = isDark ? BRAND.white : BRAND.deepBlue;
    const margin      = Math.round(60 * S);
    const textX       = isDarkSplit ? Math.round(width * 0.56) : margin;
    const textMaxW    = Math.round(400 * S);

    const activeLogo = isDark ? logoWhiteRef.current : logoColorRef.current;
    if (activeLogo) {
      const logoW    = Math.round(220 * S);
      const logoH    = Math.round(logoW / (activeLogo.width / activeLogo.height));
      const logoTopY = selectedStyle === "fullBleed" ? height * 0.04 : Math.round(55 * S);
      if (selectedStyle === "bottomPhoto") {
        ctx.drawImage(activeLogo, width - margin - logoW, Math.round(48 * S), logoW, logoH);
      } else {
        ctx.drawImage(activeLogo, textX, logoTopY, logoW, logoH);
      }
    }

    const weAreSize = Math.round(54 * S);
    ctx.font      = "700 " + weAreSize + "px " + BRAND.fontFamily + ", sans-serif";
    ctx.fillStyle = textColor;
    ctx.textAlign = "left";
    let weAreYBase = 340;
    if (selectedStyle === "fullBleed")    weAreYBase = 500;
    if (selectedStyle === "bottomPhoto")  weAreYBase = 145;
    if (selectedStyle === "sideOverlay")  weAreYBase = 300;
    if (isDarkSplit)                      weAreYBase = 300;
    if (selectedStyle === "lightPattern") weAreYBase = 240;
    const weAreY = Math.round(weAreYBase * S);
    ctx.fillText("We are", textX, weAreY);

    const hiringSize = Math.round(118 * S);
    ctx.font      = "900 " + hiringSize + "px " + BRAND.fontFamily + ", sans-serif";
    ctx.fillStyle = BRAND.aqua;
    const hiringY = weAreY + Math.round(108 * S);
    ctx.fillText("HIRING", textX, hiringY);

    const titleSize = Math.round(38 * S);
    ctx.font      = "600 " + titleSize + "px " + BRAND.fontFamily + ", sans-serif";
    ctx.fillStyle = textColor;
    const words = jobTitle.split(" ");
    const titleLines = [];
    let cur = "";
    for (const w of words) {
      const test = cur ? cur + " " + w : w;
      if (ctx.measureText(test).width > textMaxW && cur) { titleLines.push(cur); cur = w; }
      else cur = test;
    }
    if (cur) titleLines.push(cur);
    const titleY = hiringY + Math.round(56 * S);
    titleLines.forEach((line, i) => {
      ctx.fillText(line, textX, titleY + i * Math.round(titleSize * 1.25));
    });

    const ctaTopY = titleY + titleLines.length * Math.round(titleSize * 1.25) + Math.round(48 * S);
    const ctaSize = Math.round(26 * S);
    ctx.font      = "700 " + ctaSize + "px " + BRAND.fontFamily + ", sans-serif";
    ctx.fillStyle = textColor;
    ctx.fillText("APPLY NOW ON:", textX, ctaTopY);
    ctx.font      = "400 " + ctaSize + "px " + BRAND.fontFamily + ", sans-serif";
    ctx.fillStyle = BRAND.aqua;
    ctx.fillText("hr@arqgroup.com", textX, ctaTopY + Math.round(ctaSize * 1.5));

  }, [selectedSize, selectedStyle, bgImage, jobTitle, fontsReady, logosReady]);

  useEffect(() => { draw(); }, [draw]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const safeTitle = jobTitle.replace(/[^a-zA-Z0-9]/g, "_");
      const dataUrl   = canvas.toDataURL("image/png");
      const link      = document.createElement("a");
      link.download   = "ARQ_" + safeTitle + "_" + SIZES[selectedSize].label + ".png";
      link.href = dataUrl;
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
    } catch (e) {
      const win = window.open();
      if (win) win.document.write('<img src="' + canvasRef.current.toDataURL("image/png") + '" style="max-width:100%"/>');
    }
  };

  const size     = SIZES[selectedSize];
  const scale    = 460 / size.width;
  const previewW = size.width  * scale;
  const previewH = size.height * scale;

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #060f1e 0%, #0D2D6C 60%, #060f1e 100%)", padding: "28px 20px", fontFamily: "'Barlow', sans-serif", color: "#fff" }}>
      <div style={{ maxWidth: 980, margin: "0 auto 24px", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: "linear-gradient(135deg," + BRAND.aqua + "," + BRAND.green + ")", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 16, color: BRAND.deepBlue }}>A</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>ARQ Banner Generator</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Social media recruitment banners</div>
        </div>
      </div>

      <div style={{ maxWidth: 980, margin: "0 auto", display: "grid", gridTemplateColumns: "320px 1fr", gap: 24, alignItems: "start" }}>
        <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 14, padding: 22, border: "1px solid rgba(255,255,255,0.07)", display: "flex", flexDirection: "column", gap: 4 }}>

          <div style={labelStyle}>Platform</div>
          <div style={{ display: "flex", gap: 5, marginBottom: 16, flexWrap: "wrap" }}>
            {Object.entries(SIZES).map(([key, s]) => (
              <button key={key} onClick={() => setSelectedSize(key)} style={{ ...chipStyle, border: selectedSize === key ? "2px solid " + BRAND.aqua : "2px solid rgba(255,255,255,0.1)", background: selectedSize === key ? "rgba(0,205,239,0.12)" : "rgba(255,255,255,0.04)", color: selectedSize === key ? BRAND.aqua : "rgba(255,255,255,0.6)" }}>
                {s.label}<span style={{ display: "block", fontSize: 9, opacity: 0.6, marginTop: 1 }}>{s.dimensions}</span>
              </button>
            ))}
          </div>

          <div style={labelStyle}>Background Style</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 16 }}>
            {Object.entries(STYLES).map(([key, s]) => (
              <button key={key} onClick={() => setSelectedStyle(key)} style={{ padding: "9px 10px", borderRadius: 8, border: selectedStyle === key ? "2px solid " + BRAND.aqua : "2px solid rgba(255,255,255,0.1)", background: selectedStyle === key ? "rgba(0,205,239,0.1)" : "rgba(255,255,255,0.04)", color: selectedStyle === key ? BRAND.aqua : "rgba(255,255,255,0.6)", cursor: "pointer", textAlign: "left", fontFamily: "'Barlow', sans-serif", transition: "all 0.15s" }}>
                <div style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.2 }}>{s.label}</div>
                <div style={{ fontSize: 9, opacity: 0.55, marginTop: 3, lineHeight: 1.3 }}>{s.description}</div>
              </button>
            ))}
          </div>

          <div style={labelStyle}>Job Title</div>
          <input type="text" value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="e.g. HR Executive" style={inputStyle} />

          <div style={labelStyle}>Background Photo</div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} style={{ display: "none" }} />
          <button onClick={() => fileInputRef.current.click()} style={{ ...inputStyle, cursor: "pointer", textAlign: "left", background: imageSource === "upload" ? "rgba(0,205,239,0.1)" : "rgba(255,255,255,0.05)", border: imageSource === "upload" ? "1px solid " + BRAND.aqua : "1px solid rgba(255,255,255,0.1)", color: imageSource === "upload" ? BRAND.aqua : "rgba(255,255,255,0.4)", marginBottom: 6 }}>
            {imageSource === "upload" ? "✓ Image uploaded" : "⬆ Upload from device"}
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>OR</span>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
          </div>

          <input type="text" value={imageUrl} onChange={e => { setImageUrl(e.target.value); setImageSource("url"); if (!e.target.value) clearImage(); }} placeholder="Paste an image URL" style={{ ...inputStyle, border: imageError ? "1px solid #ff6b6b" : imageSource === "url" ? "1px solid " + BRAND.aqua : "1px solid rgba(255,255,255,0.1)" }} />
          {imageError && <p style={{ color: "#ff6b6b", fontSize: 11, margin: "-4px 0 8px" }}>Could not load — try uploading directly.</p>}
          {bgImage && <button onClick={clearImage} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", fontSize: 11, cursor: "pointer", marginBottom: 10, padding: 0, textDecoration: "underline", textAlign: "left" }}>✕ Remove image</button>}

          <button onClick={handleDownload} style={{ marginTop: 8, padding: "13px 0", borderRadius: 9, border: "none", background: "linear-gradient(135deg," + BRAND.aqua + "," + BRAND.green + ")", color: BRAND.deepBlue, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "'Barlow', sans-serif", letterSpacing: "0.3px" }}>
            ↓ Download {SIZES[selectedSize].label} PNG
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ background: "rgba(0,0,0,0.25)", borderRadius: 10, padding: 14, border: "1px solid rgba(255,255,255,0.05)" }}>
            <canvas ref={canvasRef} style={{ width: previewW, height: previewH, borderRadius: 3, display: "block" }} />
          </div>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 8, textAlign: "center" }}>
            Preview scaled — download is full resolution ({size.dimensions})
          </p>
        </div>
      </div>
    </div>
  );
}

const labelStyle = { fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 6 };
const inputStyle = { width: "100%", padding: "9px 12px", borderRadius: 7, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#fff", fontSize: 13, fontFamily: "'Barlow', sans-serif", marginBottom: 14, outline: "none", boxSizing: "border-box" };
const chipStyle  = { padding: "7px 12px", borderRadius: 7, cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "'Barlow', sans-serif", transition: "all 0.15s" };