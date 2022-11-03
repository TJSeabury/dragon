#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use curl::easy::{Easy, List};
use std::collections::HashMap;
use std::sync::{mpsc, Arc, Mutex};
use std::thread;
use std::time::Duration;

#[derive(Debug, Clone)]
pub struct InnerAppState {
    pub statuses: HashMap<&'static str, u32>,
}

impl InnerAppState {
    pub fn reset(&mut self) {
        self.statuses = HashMap::new();
    }
}

#[derive(Debug, Clone)]
pub struct AppState(pub Arc<Mutex<InnerAppState>>);

fn main() {
    let state = AppState(Arc::new(Mutex::new(InnerAppState {
        statuses: HashMap::new(),
    })));

    let domains = vec![
        "https://marketmentors.com",
        "https://www.ssfpc.com/",
        "https://leveltwostudios.com/",
        "https://donutdip.com/",
        "https://horacesmithfund.org/",
    ];

    let thread_arc = state.clone();
    thread::spawn(move || {
        let (tx, rx) = mpsc::channel::<(&str, u32)>();

        for d in domains {
            let mut guard = thread_arc.0.lock().unwrap();
            guard.statuses.insert(d, 0);
            thread::spawn(vitals_monitor(d, 30000, tx.clone()));
        }

        for received in rx {
            let mut guard = thread_arc.0.lock().unwrap();
            guard.statuses.insert(received.0, received.1);
            //println!("{}: {}", received.0, received.1);
        }
    });

    let thread_arc = state.clone();
    tauri::Builder::default()
        .manage(thread_arc)
        .invoke_handler(tauri::generate_handler![greet, statuses])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn statuses(state: tauri::State<AppState>) -> HashMap<&str, u32> {
    let state_guard = state.0.lock().unwrap();
    // Change field of state struct
    //state_guard.foo = String::from("bar");
    // Call method on state struct
    //state_guard.reset();
    // Replace state struct; here you need to dereference the guard to get the pointer to the inner value (I think)
    //*state_guard = InnerGameState { foo: String::from("bar") };
    state_guard.statuses.clone()
}

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

fn vitals_monitor(
    domain: &'static str,
    interval: u64,
    tx: mpsc::Sender<(&'static str, u32)>,
) -> impl Fn() {
    move || {
        let mut easy = Easy::new();
        easy.url(domain).unwrap();
        easy.follow_location(true).unwrap();

        let h_arr = [
          "Accept:\"text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8\"",
          "Accept-Encoding:\"identity\"",
          "Accept-Language:\"en-US,en;q=0.5\"",
          "User-Agent:\"Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:96.0) Gecko/20100101 Firefox/96.0\"",
        ];
        let mut headers = List::new();
        let mut err: Result<(), curl::Error>;
        for h in h_arr {
            err = headers.append(h);
            if err.is_err() {
                return;
            }
        }

        easy.http_headers(headers).unwrap();

        loop {
            easy.write_function(|data| Ok(data.len())).unwrap();
            easy.perform().unwrap();

            let code = easy.response_code().unwrap();

            tx.send((domain, code)).unwrap();

            std::thread::sleep(Duration::from_millis(interval));
        }
    }
}
