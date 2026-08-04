// Naya PIN Login Code
document.getElementById("pinBtn").onclick = async () => {
    
    // User ne jo PIN input me daala hai
    let pinInput = document.getElementById("pin").value.trim();

    if (pinInput === "") {
        alert("Please enter a PIN");
        return;
    }

    try {
        // 1. Firebase database se PIN mangwayein
        let pinRef = ref(database, "admin/master_pin"); 
        let snapshot = await get(pinRef);

        if (snapshot.exists()) {
            
            // 2. Database se PIN mil gaya
            let dbPin = snapshot.val(); 

            // 3. Match karein: User ka PIN == Database ka PIN
            if (pinInput === dbPin) {
                
                await deviceLock("pin_device", "PIN Login");
                openCalculator();
                
            } else {
                alert("Wrong PIN");
            }
            
        } else {
            alert("Error: Database me PIN set nahi hai. Pehle Firebase me PIN add karein.");
        }

    } catch (e) {
        alert("Error connecting to database: " + e.message);
    }
};
