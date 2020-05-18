export async function createUser(ownerId: string, userId: string) {
  console.log('Runtime createUser', ownerId, userId);

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
