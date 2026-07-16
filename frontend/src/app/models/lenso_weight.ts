export class LensoWeight {
  constructor(
    public ItemCode: string,
    public UOM: string,
    public Rate: number,
    public Shelf: string,
    public MinQty: number,
    public MaxQty: number,
    public NormalLevel: number,
    public ReOLevel: number,
    public ReOQty: number,
    public FOCLevel: number,
    public FOCQty: number,
    public BonusPointQty: number,
    public BonusPoint: number,
    public Weight: number,
    public WeightUOM: string,
    public Volume: number,
    public VolumeUOM: string,
    public BarCode: string,
    public LastUpdate: Date,
    public RedeemBonusPoint: number,
    public CSGNQty: number,
    public Guid: string,
    public Measurement: string
  ) {}
}