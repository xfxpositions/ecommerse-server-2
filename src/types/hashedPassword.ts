interface IHashedPassword {
  hash: string;
  saltKey: Buffer;
}

export default IHashedPassword;
