export interface Shares_status_interface {
    total_dispatched : number,
    total_dispatched_value : number,
    CPA : number,
    share_types: {
        cheap : Share_distribution_interface,
        middle : Share_distribution_interface,
        expensive : Share_distribution_interface
    }
}


interface Share_distribution_interface {
    chance : number,
    min : number,
    max : number,
    total_dispatched : number,
    total_dispatched_value : number
}

export interface Organized_shares  {
    cheap : Array<Share_interface>,
    middle : Array<Share_interface>,
    expensive : Array<Share_interface>,
    very_expensive : Array<Share_interface>
}
export interface Share_interface {
    symbol : string,
    price : number,
    amount? : number
}