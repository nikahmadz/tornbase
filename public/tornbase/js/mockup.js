// mockup
const
useIncorrectKey=function(db,result){
  db.user={};
  result.user={error: {code: "802", error: "Incorrect key"}}
},
useCorrectKey=function(db,result){
  db.user={"rank":"Star Trader","level":999,"gender":"Male","property":"Private Island","signup":"2018-05-17 06:42:50","awards":999,"friends":99,"enemies":0,"forum_posts":999,"karma":999,"age":999,"role":"Civilian","donator":1,"player_id":2124948,"name":"JohnTrevor","property_id":751908,"life":{"current":9999,"maximum":9999,"increment":87,"interval":300,"ticktime":249,"fulltime":1149},"status":["In Cayman Islands returning",""],"job":{"position":"Employee","company_id":75842,"company_name":"Poke and Smoke"},"faction":{"position":"Member","faction_id":20567,"days_in_faction":476,"faction_name":"Fate No More"},"married":{"spouse_id":289107,"spouse_name":"AlphA-9","duration":474},"basicicons":{"icon6":"Male","icon8":"Married - To AlphA-9","icon27":"Company - Employee of Poke and Smoke (Adult Novelties)","icon9":"Faction - Member of Fate No More","icon35":"Bazaar - This person has items in their bazaar for sale","icon71":"Traveling"},"states":{"hospital_timestamp":0,"jail_timestamp":0},"last_action":{"timestamp":1567905491,"relative":"22 minutes ago"}}
  result.user={success: {code: "200", success: "Success"}}
},
makeUserSubs=function(db,result){
  db.user_notifications={"notifications":{"messages":0,"events":1,"awards":1,"competition":0}}
  db.user_bars={"server_time":1568096623,"happy":{"current":9999,"maximum":9999,"increment":5,"interval":900,"ticktime":377,"fulltime":0},"life":{"current":9999,"maximum":9999,"increment":91,"interval":300,"ticktime":77,"fulltime":0},"energy":{"current":1000,"maximum":1000,"increment":5,"interval":900,"ticktime":377,"fulltime":0},"nerve":{"current":99,"maximum":99,"increment":1,"interval":300,"ticktime":77,"fulltime":0},"chain":{"current":0,"maximum":500,"timeout":0,"modifier":1,"cooldown":0}}
  db.user_money={"points":0,"cayman_bank":1000,"vault_amount":1000,"networth":1000,"money_onhand":0,"city_bank":{"amount":1000,"time_left":6207282}}
}
;
