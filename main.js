/* =========================================================
   ANDROID / GLASS ADD-ON (opt-in)
   Enable with: <section class="info-section android-cards" id="services">
   ========================================================= */
.info-section.android-cards{
  --card-surface: rgba(255,255,255,.66);
  --card-border : rgba(255,255,255,.48);
  --ring       : rgba(16,171,222,.35);  /* medical blue */
  --ring-2     : rgba(168,85,247,.35);  /* soft purple */
  --shadow-1   : 0 10px 28px rgba(2,6,23,.14);
  --shadow-2   : 0 16px 40px rgba(2,6,23,.18);
  --blur       : 14px;
}

/* Title – subtle Android lift */
.info-section.android-cards .section-title{
  display:inline-block;
  padding:.25rem .75rem;
  border-radius:12px;
  background:linear-gradient(180deg, rgba(255,255,255,.65), rgba(255,255,255,.35));
  border:1px solid rgba(255,255,255,.5);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: var(--shadow-1);
}

/* Search – pill, glassy, with focus ring */
.info-section.android-cards #complaintInput{
  border:1px solid var(--card-border);
  background:linear-gradient(180deg, rgba(255,255,255,.65), rgba(255,255,255,.38));
  backdrop-filter: blur(10px) saturate(1.1);
  -webkit-backdrop-filter: blur(10px) saturate(1.1);
  border-radius: 999px;
  padding: 14px 18px;
  box-shadow: var(--shadow-1), inset 0 1px 0 rgba(255,255,255,.5);
  transition: box-shadow .25s, border-color .25s, transform .25s;
}
.info-section.android-cards #complaintInput:focus{
  outline: none;
  transform: translateY(-1px);
  border-color: var(--ring);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--ring) 35%, transparent), var(--shadow-2);
}

/* Grid – add spacing + playful stagger on load */
.info-section.android-cards .services-grid{
  gap: 2rem;
  perspective: 1200px; /* for subtle 3D lift */
}

/* Card – glass, gradient ring, 3D hover */
.info-section.android-cards .service-card{
  position: relative;
  overflow: hidden;
  background: var(--card-surface);
  border: 1px solid var(--card-border);
  border-radius: 16px;
  backdrop-filter: blur(var(--blur)) saturate(1.1);
  -webkit-backdrop-filter: blur(var(--blur)) saturate(1.1);
  box-shadow: var(--shadow-1), inset 0 1px 0 rgba(255,255,255,.45);
  transform: translateY(0) rotateX(0) rotateY(0);
  transition: transform .35s cubic-bezier(.2,.8,.2,1), box-shadow .35s, background .35s;
}

/* Animated gradient ring (shows on hover) */
.info-section.android-cards .service-card::before{
  content:"";
  position:absolute; inset:-1px;
  border-radius: inherit;
  padding:1px;
  background: conic-gradient(from 180deg at 50% 50%,
              transparent 0%,
              color-mix(in srgb, var(--ring) 80%, transparent) 25%,
              color-mix(in srgb, var(--ring-2) 80%, transparent) 55%,
              transparent 85%);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor; mask-composite: exclude;
  opacity: 0;
  transform: scale(1.02);
  transition: opacity .35s, transform .35s;
}

/* Soft corner glow */
.info-section.android-cards .service-card::after{
  content:"";
  position:absolute; width:120px; height:120px;
  right:-40px; top:-40px;
  background: radial-gradient(120px 120px at 50% 50%,
              color-mix(in srgb, var(--ring) 50%, transparent) 0%,
              transparent 70%);
  filter: blur(10px);
  opacity:.25;
  pointer-events:none;
  transition: opacity .35s, transform .35s;
}

.info-section.android-cards .service-card:hover{
  transform: translateY(-8px) scale(1.01) rotateX(.7deg) rotateY(.7deg);
  box-shadow: var(--shadow-2);
}
.info-section.android-cards .service-card:hover::before{ opacity:1; transform:none; }
.info-section.android-cards .service-card:hover::after{ opacity:.45; transform: translate(-6px, -6px); }

/* Image – gentle zoom + sheen */
.info-section.android-cards .service-card img{
  border-radius: 12px;
  transform: scale(1);
  transition: transform .45s cubic-bezier(.2,.8,.2,1), filter .45s;
}
.info-section.android-cards .service-card:hover img{ transform: scale(1.03); }

/* Sheen sweep on hover */
.info-section.android-cards .service-card .text-section{
  position: relative;
  z-index: 1;
}
.info-section.android-cards .service-card .text-section::after{
  content:"";
  position:absolute; inset:-12px -16px auto -16px; height: 70px;
  background: linear-gradient(120deg, transparent, rgba(255,255,255,.55), transparent);
  transform: translateX(-120%) rotate(3deg);
  opacity: 0;
  pointer-events:none;
  transition: transform .8s ease, opacity .4s ease;
}
.info-section.android-cards .service-card:hover .text-section::after{
  transform: translateX(120%) rotate(3deg);
  opacity: .7;
}

/* Headings/body inside card */
.info-section.android-cards .text-section h3{
  color:#0b3a6f;
  letter-spacing:.2px;
}
.info-section.android-cards .text-section p{
  color:#465566;
  line-height:1.55;
}

/* Button – Android ripple-ish + focus ring */
.info-section.android-cards .read-more-button{
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  padding: 8px 12px;
  border:1px solid color-mix(in srgb, var(--ring) 35%, transparent);
  background: linear-gradient(180deg, rgba(255,255,255,.9), rgba(255,255,255,.75));
  box-shadow: 0 6px 18px rgba(2,6,23,.10);
  transition: transform .25s, box-shadow .25s, background .25s;
}
.info-section.android-cards .read-more-button:hover{
  transform: translateY(-1px);
  background: linear-gradient(180deg, rgba(255,255,255,1), rgba(255,255,255,.85));
  box-shadow: 0 12px 28px rgba(2,6,23,.18);
}
.info-section.android-cards .read-more-button:active{ transform: translateY(0); }
.info-section.android-cards .read-more-button:focus-visible{
  outline: none;
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--ring) 35%, transparent);
}

/* Faux ripple */
.info-section.android-cards .read-more-button::after{
  content:"";
  position:absolute; inset:0;
  background: radial-gradient(120px 120px at var(--x,50%) var(--y,50%), rgba(16,171,222,.18), transparent 60%);
  opacity: 0; transition: opacity .25s;
}
.info-section.android-cards .read-more-button:hover::after{ opacity: 1; }

/* Staggered entrance */
@keyframes cardPop{
  from{ opacity:0; transform: translateY(16px) scale(.98); }
  to  { opacity:1; transform: translateY(0)   scale(1); }
}
.info-section.android-cards .service-card{
  animation: cardPop .45s both;
}
.info-section.android-cards .service-card:nth-child(1){ animation-delay: .02s; }
.info-section.android-cards .service-card:nth-child(2){ animation-delay: .06s; }
.info-section.android-cards .service-card:nth-child(3){ animation-delay: .10s; }
.info-section.android-cards .service-card:nth-child(4){ animation-delay: .14s; }
.info-section.android-cards .service-card:nth-child(5){ animation-delay: .18s; }
.info-section.android-cards .service-card:nth-child(6){ animation-delay: .22s; }

/* Motion-safe fallback */
@media (prefers-reduced-motion: reduce){
  .info-section.android-cards .service-card,
  .info-section.android-cards .read-more-button,
  .info-section.android-cards #complaintInput{
    transition: none!important;
    animation: none!important;
    transform: none!important;
  }
}
