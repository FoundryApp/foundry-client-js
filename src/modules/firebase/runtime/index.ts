import axios from 'axios';

export async function createUser(developerID: string, developerAppProjectID: string, userID: string) {
  console.log('Runtime createUser', developerID, developerAppProjectID, userID);

  return axios({
    method: 'POST',
    url: 'localhost:8000/firebase/auth/user',
    headers: {
      'content-type': 'application/json',
    },
    data: {
      data: {
        projectId: developerAppProjectID,
        developerId: developerID,
        userId: userID,
      }
    }
  });
}
