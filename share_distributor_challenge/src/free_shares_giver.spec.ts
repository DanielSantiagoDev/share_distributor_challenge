import {Free_shares_giver} from './Free_shares_giver';
import 'jest';


describe('General giving shares tests',  () => {



  it('Should have at least one share per share price range', async () => {
    const share_giver = new Free_shares_giver(false,false);
    await share_giver.bootstrap();
    let organized_shares = share_giver.organized_shares;
    expect(organized_shares.cheap.length > 0).toEqual(true);
    expect(organized_shares.middle.length > 0).toEqual(true);
    expect(organized_shares.expensive.length > 0).toEqual(true);
  })

  it('Getting a random share in a range should return a share wich price is in between the described price range', async () => {
    const share_giver = new Free_shares_giver(false,false);
    await share_giver.bootstrap();
    let status = share_giver.share_status;
    let cheap_share = share_giver.get_Share("cheap");
    let middle_share = share_giver.get_Share("middle");
    let expensive_share = share_giver.get_Share("expensive");
    
    expect( (status.share_types.cheap.min < cheap_share.price) && (cheap_share.price <=status.share_types.cheap.max) ).toEqual(true);
    expect( (status.share_types.middle.min < middle_share.price) && (middle_share.price <=status.share_types.middle.max) ).toEqual(true);
    expect( (status.share_types.expensive.min < expensive_share.price) && (expensive_share.price <=status.share_types.expensive.max) ).toEqual(true);

  })

  it('Getting a random share should be reflected on the global statistics', async () => {
    const share_giver = new Free_shares_giver(false,false);
    await share_giver.bootstrap();

    let status = share_giver.share_status;
    let cheap_share = share_giver.get_Share("cheap");
    let middle_share = share_giver.get_Share("middle");
    let expensive_share = share_giver.get_Share("expensive");
    
    expect( status.share_types.cheap.total_dispatched ).toEqual(1);
    expect( status.share_types.cheap.total_dispatched_value ).toEqual(cheap_share.price);
    expect( status.share_types.middle.total_dispatched).toEqual(1);
    expect( status.share_types.middle.total_dispatched_value ).toEqual(middle_share.price);
    expect( status.share_types.expensive.total_dispatched).toEqual(1);
    expect( status.share_types.expensive.total_dispatched_value ).toEqual(expensive_share.price);

    expect( status.total_dispatched).toEqual(3);
    expect( status.total_dispatched_value ).toEqual(cheap_share.price + middle_share.price +  expensive_share.price);

  })

  it('Share should be distributed by price range depending of the % of each type of being chosen, with CPA OFF', async () => {
    const share_giver = new Free_shares_giver(false,false);
    await share_giver.bootstrap();
    
    let status = share_giver.share_status;

    let runs = 200;
    for(let i = 0; i< runs; i++){
      share_giver.get_free_share()
    }
    
    expect(status.total_dispatched).toEqual(runs);
    expect(status.share_types.cheap.total_dispatched).toEqual(status.share_types.cheap.chance * runs);
    expect(status.share_types.middle.total_dispatched).toEqual(status.share_types.middle.chance * runs);
    expect(status.share_types.expensive.total_dispatched).toEqual(status.share_types.expensive.chance * runs);
  })

  it('give_share_to_user Should give a share to a user, returning wich one was given', async () => {
    const share_giver = new Free_shares_giver();
    await share_giver.bootstrap();
    
    let status = share_giver.share_status;
    let share = await share_giver.give_share_to_user("x-default-user");
  
    
    expect(share).toHaveProperty("symbol");
    expect(share).toHaveProperty("price");
    expect(status.total_dispatched).toEqual(1);
    expect(status.total_dispatched_value > 0).toEqual(true);

  })

 

  
}) 

describe('Giving shares with a CPA target',  () => {

  it('Target CPA should be nearly equal to current CPA after 100+ shares given (0.1 precision)', async () => {

    const share_giver = new Free_shares_giver(true,false);
    await share_giver.bootstrap();
    
    let status = share_giver.share_status;
    
    
    let runs = 100;
    for(let i = 0; i< runs; i++){
      share_giver.get_free_share()
    }

    let targetCPA  = status.CPA
    let currentCPA = status.total_dispatched_value/status.total_dispatched
    let CPA_difference = Math.abs((currentCPA / targetCPA) - 1);

    expect(CPA_difference < 0.1).toEqual(true);


  })


})


describe('Giving all share as partial shares of very expensive ones',  () => {

  it('Shares should be given as partial shares of a bigger one', async () => {

    const share_giver = new Free_shares_giver(false,true);
    await share_giver.bootstrap();
    
    let status = share_giver.given_partials;
  
    
    let runs = 100;
    for(let i = 0; i< runs; i++){
      share_giver.get_free_share();
    }

    
    for (let key in status) {

      let found = share_giver.organized_shares.very_expensive.findIndex((share)=>{
        return share.symbol === key
      })
      expect(found != -1).toEqual(true);

    
    }


    

  })


}) 