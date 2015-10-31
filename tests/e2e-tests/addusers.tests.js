describe('Clicking on the users button will ', function(){  
    beforeEach(function() {
        browser.get('/');
        browser.executeScript('window.localStorage.clear();');
        usersButton = element(by.xpath("//button[contains(.,'Users')]"));
        addUsersButton = element(by.id('add-user-button'));
        followUserButton = element(by.xpath("//button[contains(.,'Follow User')]"));
    });

    it('open the users side menu and show two default users ', function() {
        usersButton.click().then(function() {
            element.all(by.css('.username')).then(function(items) {
                expect(items.length).toBe(2);
                expect(items[0].getText()).toBe('Here_Comes_The_King');
                expect(items[1].getText()).toBe('GovSchwarzenegger');
            });
        });
    })

    it('open the users side menu and does not allow adding a duplicate user', function() {
        usersButton.click().then(function() {
            browser.sleep(1000)
            addUsersButton.click().then(function(){
                element(by.model('user.username')).sendKeys("Here_Comes_The_King");
                followUserButton.click();

                browser.sleep(3000);
                var popup = element(by.css('.popup-container.popup-showing.active'));
                expect(popup.isDisplayed()).toBeTruthy();
                expect(popup.getText()).toMatch(/Here_Comes_The_King is already being followed./);
                
                element.all(by.css('.username')).then(function(items) {
                    expect(items.length).toBe(2);
                });
            })
        });
    })

    it('open the users side menu and enables adding a validated user', function() {
        usersButton.click().then(function() {
            browser.sleep(1000)
            addUsersButton.click().then(function(){
                element(by.model('user.username')).sendKeys("ALEX");
                followUserButton.click();
                element.all(by.css('.username')).then(function(items) {
                    expect(items.length).toBe(3);
                    expect(items[2].getText()).toBe('alex');

                    //Refresh browser because first added user will remove default users
                    browser.refresh();
                    element.all(by.css('.username')).then(function(items) {
                        expect(items.length).toBe(1);
                        expect(items[0].getText()).toBe('alex');
                    });
                });
            }) 
        });
    })
});