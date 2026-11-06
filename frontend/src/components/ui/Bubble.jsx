/** Round glass icon bubble used at the top of the simple pages. */
export default function Bubble({ icon: Icon }) {
  return (
    <div className="bubble" aria-hidden="true">
      <Icon size={26} />
    </div>
  );
}
