import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="container" style={{ display: "flex", justifyContent: "center", paddingTop: "60px" }}>
      <SignIn />
    </div>
  );
}
