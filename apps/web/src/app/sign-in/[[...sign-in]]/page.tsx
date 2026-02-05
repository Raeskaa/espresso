import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md p-4">
        <SignIn
          afterSignInUrl="/dashboard"
          appearance={{
            elements: {
              formButtonPrimary:
                "bg-black hover:bg-gray-800 text-white",
              card: "bg-white border border-gray-200 shadow-sm rounded-2xl",
              headerTitle: "text-black",
              headerSubtitle: "text-gray-500",
              socialButtonsBlockButton:
                "border-gray-200 hover:bg-gray-50 text-black",
              formFieldInput:
                "bg-white border-gray-200 text-black rounded-lg",
              footerActionLink: "text-black hover:text-gray-600",
            },
          }}
        />
      </div>
    </div>
  );
}
