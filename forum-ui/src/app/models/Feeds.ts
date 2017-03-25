export interface Feed {
  took: number;
  timed_out: boolean;
  _shards: {
    total: number;
    successful: number;
    failed: boolean;
  };
  hits: {
    total: number;
    max_score: number;
    hits: Object[];
  };
}
