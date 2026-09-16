#![cfg(test)]
use super::*;
use soroban_sdk::{testutils::Address as _, Address, BytesN, Env, String};

fn setup(env: &Env) -> (AgentRegistryClient<'_>, Address, Address) {
    let contract_id = env.register(AgentRegistry, ());
    let client = AgentRegistryClient::new(env, &contract_id);
    let admin = Address::generate(env);
    let marketplace = Address::generate(env);
    client.init(&admin, &marketplace);
    (client, admin, marketplace)
}

#[test]
fn register_and_reputation() {
    let env = Env::default();
    env.mock_all_auths();

    let (client, _admin, _marketplace) = setup(&env);

    let owner = Address::generate(&env);
    let agent_id = BytesN::from_array(&env, &[1u8; 32]);
    client.register(&owner, &agent_id, &String::from_str(&env, "Research Agent"));

    let rep = client.get_reputation(&agent_id);
    assert_eq!(rep.jobs_completed, 0);
    assert_eq!(rep.successful_payments, 0);

    client.record_job(&agent_id, &true);
    let rep = client.get_reputation(&agent_id);
    assert_eq!(rep.jobs_completed, 1);
    assert_eq!(rep.successful_payments, 1);
    assert_eq!(rep.success_rate_bps, 10_000);
}

#[test]
fn failed_job_lowers_success_rate() {
    let env = Env::default();
    env.mock_all_auths();

    let (client, _admin, _marketplace) = setup(&env);

    let owner = Address::generate(&env);
    let agent_id = BytesN::from_array(&env, &[2u8; 32]);
    client.register(&owner, &agent_id, &String::from_str(&env, "Unreliable Agent"));

    client.record_job(&agent_id, &true);
    client.record_job(&agent_id, &false); // failed job

    let rep = client.get_reputation(&agent_id);
    assert_eq!(rep.jobs_completed, 2);
    assert_eq!(rep.successful_payments, 1);
    assert_eq!(rep.success_rate_bps, 5_000); // 50%
}

#[test]
fn duplicate_registration_fails() {
    let env = Env::default();
    env.mock_all_auths();

    let (client, _admin, _marketplace) = setup(&env);

    let owner = Address::generate(&env);
    let agent_id = BytesN::from_array(&env, &[3u8; 32]);
    client.register(&owner, &agent_id, &String::from_str(&env, "Agent A"));

    // Second registration with the same agent_id must fail.
    let res = client.try_register(&owner, &agent_id, &String::from_str(&env, "Agent A dup"));
    assert!(res.is_err(), "Duplicate registration should return AgentExists error");
}

#[test]
fn get_agent_returns_metadata() {
    let env = Env::default();
    env.mock_all_auths();

    let (client, _admin, _marketplace) = setup(&env);

    let owner = Address::generate(&env);
    let agent_id = BytesN::from_array(&env, &[4u8; 32]);
    let metadata = String::from_str(&env, "My Agent Metadata");
    client.register(&owner, &agent_id, &metadata);

    let data = client.get_agent(&agent_id);
    assert_eq!(data.metadata, metadata);
}

#[test]
fn unregistered_agent_reputation_defaults_to_zero() {
    let env = Env::default();
    env.mock_all_auths();

    let (client, _admin, _marketplace) = setup(&env);
    let missing_id = BytesN::from_array(&env, &[99u8; 32]);

    let rep = client.get_reputation(&missing_id);
    assert_eq!(rep.jobs_completed, 0);
    assert_eq!(rep.success_rate_bps, 0);
}
