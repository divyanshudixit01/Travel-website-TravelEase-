// Bespoke Apple/Google-level SVG Icon Suite for Indian Railways & Modern Transit
export const VandeBharatFrontIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    {/* Aerodynamic Train Body */}
    <path
      d="M18 18C18 10 24 6 32 6C40 6 46 10 46 18L49 38C49.5 45 46 52 32 52C18 52 14.5 45 15 38L18 18Z"
      fill="currentColor"
      fillOpacity="0.2"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
    {/* Streamlined Panoramic Windshield */}
    <path
      d="M20 19C20 14 24 12 32 12C40 12 44 14 44 19L45 28C45 30 42 32 32 32C22 32 19 30 19 28L20 19Z"
      fill="currentColor"
      fillOpacity="0.4"
      stroke="currentColor"
      strokeWidth="2"
    />
    {/* High-Intensity Twin LED Projector Headlights */}
    <ellipse cx="23" cy="42" rx="3" ry="2" fill="#F59E0B" />
    <ellipse cx="41" cy="42" rx="3" ry="2" fill="#F59E0B" />
    {/* Central Ashoka / Tri-Color Accent Line */}
    <line x1="26" y1="46" x2="38" y2="46" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" />
    {/* Bottom Cowcatcher / Deflector */}
    <path
      d="M20 52L24 58H40L44 52"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);



export const BulletTrain320Icon = ({ className = "w-6 h-6", ...props }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    {/* Ultra-Long Aerodynamic Shinkansen Nose */}
    <path
      d="M58 36C46 36 28 32 16 30C10 29 4 34 6 40C8 46 16 48 28 48H58V36Z"
      fill="currentColor"
      fillOpacity="0.25"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
    {/* Cockpit Glass */}
    <path d="M22 31C28 32 38 33 46 33V35H24L22 31Z" fill="#38BDF8" />
    {/* High Speed Lines */}
    <line x1="4" y1="54" x2="60" y2="54" stroke="currentColor" strokeWidth="2" strokeDasharray="6 4" />
    <line x1="2" y1="24" x2="16" y2="24" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
