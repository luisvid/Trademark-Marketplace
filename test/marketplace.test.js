var Marketplace = artifacts.require('Marketplace');

contract('Marketplace', (accounts) => {
  // NOTE: Because Alice is the first index of the accounts array, the Marketplace contract is always going to be
  // deployed from her account during these tests
  const alice = accounts[0];
  const bob = accounts[1];
  const charlie = accounts[2];

  /**
   * The address that deploys the Marketplace contract should become the owner of the contract and an admin.
   */
  it('should deploy user as admin and have user become owner of marketplace', async () => {
    const instance = await Marketplace.deployed();
    const result = await instance.admins(alice);
    const marketplaceOwner = await instance.owner();

    assert.isTrue(result, 'alice is admin');
    assert.isTrue(marketplaceOwner === alice, 'marketplace owner is alice')
  })

  /**
   * This test should try adding a user as an admin and then removing that user from admin.
   */
  it('should add and remove an admin', async () => {
    const instance = await Marketplace.deployed();

    await instance.addAdmin(bob);
    const addAdmin = await instance.admins(bob);

    await instance.removeAdmin(bob);
    const removeAdmin = await instance.admins(bob);

    assert.isTrue(addAdmin, 'bob is admin');
    assert.isFalse(removeAdmin, 'now bob is not');
  })

  /**
   * Non-admins should not be able to add addresses to neither the admins nor storeOwners mapping. This test verifies
   * that non-admins do not have those privileges.
   */
  it('non admins cannot modify admin or mappings', async () => {
    const instance = await Marketplace.deployed();

    try {
      await instance.addAdmin(bob, { from: charlie });
    } catch (error) {
      const revertFound = error.message.search('revert') >= 0;
      assert(revertFound, `Expected "revert", got ${error} instead`);
    }

    try {
      await instance.addStoreOwner(bob, { from: charlie });
    } catch (error) {
      const revertFound = error.message.search('revert') >= 0;
      assert(revertFound, `Expected "revert", got ${error} instead`);
      return;
    }

    assert.fail('Expected revert not received');
  })

  /**
   * Admins should not be able to remove the owner from the storeOwner mapping. The owner should be like a "super admin"
   */
  it('admin cannot remove owner as admin', async () => {
    const instance = await Marketplace.deployed();

    try {
      await instance.addAdmin(bob);
      await instance.removeAdmin(alice, { from: bob });
    } catch (error) {
      const revertFound = error.message.search('revert') >= 0;
      assert(revertFound, `Expected "revert", got ${error} instead`);
      return;
    }

    assert.fail('Expected revert not received');
  })

  /**
   * Admins should be able to add and remove a store owner.
   */
  it('should add and remove a store owner', async () => {
    const instance = await Marketplace.deployed();

    await instance.addStoreOwner(bob);
    const addStoreOwner = await instance.storeOwners(bob);

    await instance.removeStoreOwner(bob);
    const removeStoreOwner = await instance.storeOwners(bob);

    assert.isTrue(addStoreOwner, 'bob is store owner');
    assert.isFalse(removeStoreOwner, 'now bob is not');
  })

})
