export async function createUser(developerID: string, developerAppProjectID: string, userID: string) {
  console.log('Runtime createUser', developerID, developerAppProjectID, userID);

  // TODO: Use axios & uncomment

  // ky('localhost:8000/firebase/auth/user', {
  //   method: 'POST',
  //   json: {
  //     data: {
  //       developerId: ownerId,
  //       userId,
  //     },
  //   },
  //   responseType: 'json',
  // });
}
