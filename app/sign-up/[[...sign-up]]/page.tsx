import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="container" style={{ display: "flex", justifyContent: "center", paddingTop: "60px" }}>
      <SignUp />
    </div>
  );
}
