type DatabaseConstraintError = {
  type: 'unique' | 'check' | 'not null' | 'foreign key' | 'unknown';
  columnName?: string;
  message?: string;
};

type AuthRequest = {
  username: string;
  password: string;
};

type OriginalUrl = {
  originalUrl: string;
};

type TargetLinkId = {
  targetLinkId: string;
};
