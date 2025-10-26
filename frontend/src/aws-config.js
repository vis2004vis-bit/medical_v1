import { Amplify } from "aws-amplify";

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: "ap-south-1_ly1jRPGG0",
      userPoolClientId: "6qmfd0tkbn63eh17kgvl517lmb",
      region: "ap-south-1",
    },
  },
});
