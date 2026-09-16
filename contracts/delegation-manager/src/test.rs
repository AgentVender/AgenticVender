#![cfg(test)]
use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env};

fn setup(env: &Env) -> (DelegationManagerClient<'_>, Address, Address) {
    let contract_id = env.register(DelegationManager, ());
    let client = DelegationManagerClient::new(env, &contract_id);
    let admin = Address::generate(env);
    let marketplace = Address::generate(env);
    client.init(&admin, &marketplace);
    (client, marketplace, admin)
}

#[test]
fn grant_and_spend_within_limit() {
    let env = Env::default();
    env.mock_all_auths();
    let (client, _mkt, _admin) = setup(&env);

    let owner = Address::generate(&env);
    let agent = Address::generate(&env);
    let token = Address::generate(&env);

    client.grant(&owner, &agent, &token, &10_0000000, &(env.ledger().timestamp() + 86_400));
    client.check_and_spend(&agent, &2_0000000);

    let a = client.get_allowance(&agent);
    assert_eq!(a.spent_today, 2_0000000);
}

#[test]
fn spend_over_limit_fails() {
    let env = Env::default();
    env.mock_all_auths();
    let (client, _mkt, _admin) = setup(&env);

    let owner = Address::generate(&env);
    let agent = Address::generate(&env);
    let token = Address::generate(&env);

    client.grant(&owner, &agent, &token, &3_0000000, &(env.ledger().timestamp() + 86_400));
    let res = client.try_check_and_spend(&agent, &5_0000000);
    assert!(res.is_err());
}

#[test]
fn expired_delegation_rejected() {
    let env = Env::default();
    env.mock_all_auths();
    let (client, _mkt, _admin) = setup(&env);

    let owner = Address::generate(&env);
    let agent = Address::generate(&env);
    let token = Address::generate(&env);

    // Grant with expiry in the past (timestamp 0 < current ledger time).
    let past = env.ledger().timestamp().saturating_sub(1);
    client.grant(&owner, &agent, &token, &10_0000000, &past);

    let res = client.try_check_and_spend(&agent, &1_0000000);
    assert!(res.is_err(), "Expired delegation should be rejected");
}

#[test]
fn revoke_removes_allowance() {
    let env = Env::default();
    env.mock_all_auths();
    let (client, _mkt, _admin) = setup(&env);

    let owner = Address::generate(&env);
    let agent = Address::generate(&env);
    let token = Address::generate(&env);

    client.grant(&owner, &agent, &token, &10_0000000, &(env.ledger().timestamp() + 86_400));
    client.revoke(&owner, &agent);

    // After revoke, check_and_spend must fail (NoAllowance).
    let res = client.try_check_and_spend(&agent, &1_0000000);
    assert!(res.is_err(), "Revoked delegation must not allow spending");
}

#[test]
fn daily_window_resets() {
    let env = Env::default();
    env.mock_all_auths();
    let (client, _mkt, _admin) = setup(&env);

    let owner = Address::generate(&env);
    let agent = Address::generate(&env);
    let token = Address::generate(&env);
    let limit = 5_0000000i128;

    client.grant(
        &owner,
        &agent,
        &token,
        &limit,
        &(env.ledger().timestamp() + 3 * 86_400),
    );

    // Spend the full daily limit.
    client.check_and_spend(&agent, &limit);
    let a = client.get_allowance(&agent);
    assert_eq!(a.spent_today, limit);

    // Advance ledger by 25 hours (past the 24h window).
    env.ledger().with_mut(|l| l.timestamp += 25 * 3600);

    // Window should reset — spending the full limit again should succeed.
    client.check_and_spend(&agent, &limit);
    let a2 = client.get_allowance(&agent);
    assert_eq!(a2.spent_today, limit, "Spent today should equal limit after window reset");
}
