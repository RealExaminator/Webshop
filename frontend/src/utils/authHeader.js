export default function authHeader() {
  const tokens = JSON.parse(localStorage.getItem('userTokens'));

  if (tokens && tokens.access) {
    return { Authorization: 'Bearer ' + tokens.access };
  } else {
    return {};
  }
}