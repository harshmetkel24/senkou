// import { getCurrentUserFn } from "@/lib/auth";
// import { createFileRoute, redirect } from "@tanstack/react-router";

// export const Route = createFileRoute("/_authed")({
//   beforeLoad: async ({ location }) => {
//     const user = await getCurrentUserFn();

//     console.log("Authed route - current user:", user);

//     if (!user) {
//       throw redirect({
//         to: "/login",
//         search: { redirect: location.href },
//       });
//     }

//     // Pass user to child routes
//     return { user };
//   },
// });
