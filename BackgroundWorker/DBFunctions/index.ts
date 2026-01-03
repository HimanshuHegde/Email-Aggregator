import {prisma} from '../lib/prisma';
export async function createBulkEmails(
  emails: any
) {
  try {
    console.log("Creating bulk emails");
    emails  = JSON.parse(emails);
    let array = [];
    for(let email of emails){
      array.indexOf(email.accountId) === -1 && array.push(email.accountId);
    }
    array = array.filter(async (id)=>{
      let accCheckId = await getAccountById(parseInt(id));
      if(!accCheckId){
        return false;
      }
      return true;

    })
    if(array.length===0){
      console.log("No valid account IDs found. Aborting email creation.");
      return true;
    }
    emails.filter((email: any)=>{
      return array.indexOf(email.accountId)!==-1
    })
    console.log(emails)
    for(let email of emails){
      email.aiLabel = email.aiLabel ?? "Uncategorized";
    }
    await prisma.emails.createMany({
      data: emails,
      skipDuplicates: true,
    });
    return true
  } catch (err) {
    console.error("Error creating bulk emails:", err);
    return false;
  }
}

export async function getAccountById(id: number) {
    return await prisma.account.findUnique({
        where: {
            id
        },
    });
}