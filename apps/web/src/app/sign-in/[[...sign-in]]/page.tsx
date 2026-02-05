import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/10">
      <div className="w-full max-w-md p-4">
        <SignIn
          appearance={{
            elements: {
              formButtonPrimary:
                "bg-primary hover:bg-primary/90 text-primary-foreground",
              card: "bg-card border border-border shadow-xl rounded-2xl",
              headerTitle: "text-foreground",
              headerSubtitle: "text-muted-foreground",
              socialButtonsBlockButton:
                "border-border hover:bg-muted text-foreground",
              formFieldInput:
                "bg-background border-input text-foreground rounded-xl",
              footerActionLink: "text-primary hover:text-primary/80",
            },
          }}
        />
      </div>
    </div>
  );
}
